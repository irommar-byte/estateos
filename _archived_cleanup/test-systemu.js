const RESEND_KEY = "re_NSyUAihv_7ipuiJJTcKUgTmynbh7VLi6a";
const TO_EMAIL = "irommar@icloud.com";
const FROM_EMAIL = "EstateOS <kontakt@estateos.pl>";

// Funkcja opóźniająca, żeby obejść zabezpieczenia antyspamowe Resend
const delay = ms => new Promise(res => setTimeout(res, ms));

async function sendMail(subject, htmlContent) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: subject,
      html: htmlContent
    })
  });
  const data = await res.json();
  console.log(`Wysłano: ${subject} ->`, data.id ? "SUKCES" : "BŁĄD");
}

async function runTest() {
  console.log("Rozpoczynam wysyłkę 4 scenariuszy powiadomień. Proszę czekać...\n");
  
  // 1. NOWY UŻYTKOWNIK
  await sendMail(
    "👋 Witamy w EstateOS - Twoje konto jest aktywne!", 
    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;'><h2 style='color: #333;'>Witaj na pokładzie!</h2><p style='color: #555; line-height: 1.6;'>Twoje konto w systemie <strong>EstateOS</strong> zostało pomyślnie zweryfikowane i aktywowane.</p><p style='color: #555; line-height: 1.6;'>Od teraz masz pełny dostęp do zamkniętego rynku nieruchomości premium. Uzupełnij swój profil, abyśmy mogli dopasować najlepsze okazje do Twoich preferencji.</p><br><a href='https://estateos.pl/profil' style='background: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Przejdź do profilu</a><br><br><hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'><p style='font-size: 12px; color: #999;'>Pozdrawiamy,<br>Zespół EstateOS</p></div>"
  );
  await delay(2000); // Czekamy 2 sekundy
  
  // 2. KUPUJĄCY
  await sendMail(
    "💼 Potwierdzenie rezerwacji / zainteresowania ofertą", 
    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;'><h2 style='color: #333;'>Gratulacje!</h2><p style='color: #555; line-height: 1.6;'>Otrzymaliśmy Twoje zgłoszenie dotyczące zakupu / rezerwacji dla nieruchomości <strong>Apartament Premium - Śródmieście</strong>.</p><p style='color: #555; line-height: 1.6;'>Nasz doradca skontaktuje się z Tobą w ciągu 24 godzin w celu omówienia szczegółów transakcji i przesłania dokumentów.</p><br><a href='https://estateos.pl/transakcje' style='background: #28a745; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Śledź status transakcji</a><br><br><hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'><p style='font-size: 12px; color: #999;'>Pozdrawiamy,<br>Dział Transakcji EstateOS</p></div>"
  );
  await delay(2000); // Czekamy 2 sekundy

  // 3. SPRZEDAJĄCY
  await sendMail(
    "📢 Twoja oferta została opublikowana na EstateOS", 
    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;'><h2 style='color: #333;'>Świetne wieści!</h2><p style='color: #555; line-height: 1.6;'>Nieruchomość, którą zgłosiłeś do sprzedaży, przeszła pomyślnie naszą weryfikację i jest <strong>już widoczna</strong> dla zweryfikowanych inwestorów na platformie.</p><p style='color: #555; line-height: 1.6;'>Będziemy Cię informować na bieżąco, gdy tylko pojawią się pierwsze zapytania i oferty zakupu.</p><br><a href='https://estateos.pl/moje-oferty' style='background: #007bff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Zobacz swoją ofertę</a><br><br><hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'><p style='font-size: 12px; color: #999;'>Pozdrawiamy,<br>Zespół EstateOS</p></div>"
  );
  await delay(2000); // Czekamy 2 sekundy

  // 4. SZUKAJĄCY (Dopasowana oferta)
  await sendMail(
    "🎯 Znaleźliśmy ofertę idealną dla Ciebie!", 
    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;'><h2 style='color: #333;'>Mamy Match!</h2><p style='color: #555; line-height: 1.6;'>Nasz system dopasowań właśnie zidentyfikował nową nieruchomość, która w <strong>95%</strong> odpowiada Twoim zapisanym kryteriom wyszukiwania (ROI > 8%, budownictwo po 2020 r.).</p><p style='color: #555; line-height: 1.6;'>Otrzymujesz to powiadomienie jako jeden z pierwszych. Zobacz szczegóły, zanim oferta trafi do szerszego grona.</p><br><a href='https://estateos.pl/oferty/match' style='background: #e60000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Sprawdź dopasowaną ofertę</a><br><br><hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'><p style='font-size: 12px; color: #999;'>Pozdrawiamy,<br>Inteligentny Asystent EstateOS</p></div>"
  );

  console.log("\nGotowe! Rakieta poleciała. Sprawdź skrzynkę na iCloud.");
}

runTest();
