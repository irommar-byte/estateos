const RESEND_KEY = "re_NSyUAihv_7ipuiJJTcKUgTmynbh7VLi6a";
const TO_EMAIL = "irommar@icloud.com";
const FROM_EMAIL = "EstateOS <kontakt@estateos.pl>";

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
  console.log("Rozpoczynam strzał testowy (3 maile) do " + TO_EMAIL + "...\n");
  
  // Mail 1: Rejestracja / Powitanie
  await sendMail(
    "Witamy w EstateOS! 🏡", 
    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'><h2>Cześć!</h2><p>Twoje konto inwestora na platformie <strong>EstateOS</strong> zostało pomyślnie utworzone.</p><p>Zaloguj się, aby zobaczyć najnowsze, wyselekcjonowane okazje inwestycyjne przed innymi.</p><br><a href='https://estateos.pl' style='background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Przejdź do panelu</a><br><br><p style='font-size: 12px; color: #888;'>Pozdrawiamy,<br>Zespół EstateOS</p></div>"
  );
  
  // Mail 2: Nowa inwestycja
  await sendMail(
    "🔥 Nowa oferta inwestycyjna na EstateOS", 
    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'><h2>Nowa okazja inwestycyjna!</h2><p>Dodaliśmy nową, ekskluzywną nieruchomość do platformy, która może Cię zainteresować.</p><ul><li><strong>Lokalizacja:</strong> Centrum, Premium</li><li><strong>Szacowane ROI:</strong> 8-10%</li></ul><p>Liczba udziałów jest ograniczona. Kliknij poniżej, aby poznać szczegóły.</p><br><a href='https://estateos.pl/oferty' style='background: #28a745; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Zobacz szczegóły inwestycji</a></div>"
  );

  // Mail 3: Zmiana statusu
  await sendMail(
    "✅ Ważne: Aktualizacja statusu inwestycji", 
    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'><h2>Aktualizacja Twojego portfela</h2><p>Informujemy, że jedna z obserwowanych przez Ciebie inwestycji zmieniła status na: <strong>W realizacji / Sprzedana</strong>.</p><p>Sprawdź aktualne dokumenty i postępy prac bezpośrednio w swoim panelu inwestora.</p><br><a href='https://estateos.pl/moje-inwestycje' style='background: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Sprawdź mój portfel</a></div>"
  );

  console.log("\nGotowe! Rakieta poleciała. Sprawdź skrzynkę na iCloud.");
}

runTest();
