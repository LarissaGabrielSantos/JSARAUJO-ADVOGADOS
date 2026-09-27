import fs from "node:fs";
import path from "node:path";

const required = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID",
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Variáveis Firebase ausentes: ${missing.join(", ")}`);
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

if (process.env.FIREBASE_MEASUREMENT_ID) {
  firebaseConfig.measurementId = process.env.FIREBASE_MEASUREMENT_ID;
}

const output = `// Arquivo gerado automaticamente durante o build. Não edite manualmente.\nexport const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};\n`;

const outputPath = path.resolve("links/firebase-config.js");
fs.writeFileSync(outputPath, output, { encoding: "utf8" });

console.log(`Firebase config gerado em ${outputPath}`);
