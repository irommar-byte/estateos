import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any });
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const sig = req.headers.get('stripe-signature');

    // 🔒 TWARDY WARUNEK — MUSI BYĆ SECRET I PODPIS
    if (!process.env.STRIPE_WEBHOOK_SECRET || !sig) {
      return NextResponse.json({ error: 'Webhook nieautoryzowany' }, { status: 400 });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('❌ Błąd sygnatury:', err.message);
      return NextResponse.json({ error: 'Nieprawidłowa sygnatura' }, { status: 400 });
    }

    // 🔥 reszta Twojej logiki BEZ ZMIAN
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const customerEmail = session.customer_details?.email;
      const rawPlanType = session.metadata?.plan_type || '';
      const pendingOfferId = session.metadata?.pending_offer_id;
      const offerIdToRenew = session.metadata?.offer_id_to_renew;

      if (customerEmail) {

        if (rawPlanType === 'pakiet_plus' || rawPlanType === 'renewal') {
          console.log(`🛒 Pakiet+: ${customerEmail}`);
        } else {
          let validPlanType: 'INVESTOR' | 'AGENCY' | 'NONE' = 'INVESTOR';

          if (rawPlanType.toUpperCase() === 'AGENCY') {
            validPlanType = 'AGENCY';
          }

          const proExpiresAtDate = new Date();
          proExpiresAtDate.setDate(proExpiresAtDate.getDate() + 30);

          await prisma.user.updateMany({
            where: { email: customerEmail },
            data: {
              isPro: true,
              planType: validPlanType,
              proExpiresAt: proExpiresAtDate
            }
          });
        }

        if (pendingOfferId) {
          const offerExpiresAtDate = new Date();
          offerExpiresAtDate.setDate(offerExpiresAtDate.getDate() + 30);

          await prisma.offer.updateMany({
            where: { id: Number(pendingOfferId) },
            data: {
              status: 'pending_approval',
              expiresAt: offerExpiresAtDate
            }
          });
        }

        if (rawPlanType === 'renewal' && offerIdToRenew) {
          const newExpiresAt = new Date();
          newExpiresAt.setDate(newExpiresAt.getDate() + 30);

          await prisma.offer.updateMany({
            where: { id: Number(offerIdToRenew) },
            data: {
              status: 'active',
              expiresAt: newExpiresAt
            }
          });
        }
      }
    }

    return NextResponse.json({ received: true });

  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
