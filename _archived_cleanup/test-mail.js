require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');

async function testMail() {
    const host = process.env.EMAIL_HOST?.trim();
    const user = process.env.EMAIL_USER?.trim();
    const pass = process.env.EMAIL_PASS?.trim();
    const port = Number(process.env.EMAIL_PORT?.trim()) || 587;

    console.log(`\n--- TEST POŁĄCZENIA SMTP ---`);
    console.log(`HOST: ${host}`);
    console.log(`PORT: ${port}`);
    console.log(`USER: ${user}`);
    console.log(`Wysyłam test na: irommar@icloud.com...`);
    
    const transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465,
        auth: { user: user, pass: pass },
        tls: { rejectUnauthorized: false },
        debug: true // włącza dokładne logowanie rozmowy z serwerem
    });

    try {
        let info = await transporter.sendMail({
            from: user, // Najbardziej "goły" i restrykcyjny format
            to: "irommar@icloud.com",
            subject: "Test bezpośredni EstateOS",
            text: "Jeśli to czytasz, serwer SMTP EstateOS działa poprawnie."
        });
        console.log(`\n✅ SUKCES! Mail wysłany prawidłowo.`);
        console.log(`ID Wiadomości: ${info.messageId}\n`);
    } catch (err) {
        console.log(`\n❌ BŁĄD ODRZUCENIA PRZEZ SERWER SMTP:`);
        console.error(err.message);
        console.log(`\n`);
    }
}
testMail();
