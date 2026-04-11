const fs = require('fs');

function fixFile(path, accountType, role) {
  if (!fs.existsSync(path)) {
    console.log("❌ Brak:", path);
    return;
  }

  let code = fs.readFileSync(path, 'utf8');

  if (!code.includes("prisma.user.create")) {
    console.log("⚠️ Brak create() w", path);
    return;
  }

  // zabezpieczenie — nie dodawaj drugi raz
  if (code.includes("accountType")) {
    console.log("⏭️ Już ma accountType:", path);
    return;
  }

  const lines = code.split("\n");

  let insideCreate = false;

  const newLines = lines.map(line => {
    if (line.includes("prisma.user.create")) {
      insideCreate = true;
    }

    if (insideCreate && line.includes("data: {")) {
      return line + `
      accountType: "${accountType}",
      role: "${role}",`;
    }

    if (insideCreate && line.includes("})")) {
      insideCreate = false;
    }

    return line;
  });

  fs.writeFileSync(path, newLines.join("\n"));
  console.log("✅ Naprawiono:", path);
}

fixFile("src/app/api/auth/register-agency/route.ts", "AGENCY", "AGENCY");
fixFile("src/app/api/register/route.ts", "BUYER", "USER");
