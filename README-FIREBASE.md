# JS Araújo Advogados — Área interna

## Firebase sem configuração embutida no HTML

A página `/links/index.html` não contém `firebaseConfig`.

O arquivo `links/firebase-config.js` é gerado automaticamente no build a partir de variáveis de ambiente e está no `.gitignore`.

### Variáveis necessárias

- FIREBASE_API_KEY
- FIREBASE_AUTH_DOMAIN
- FIREBASE_PROJECT_ID
- FIREBASE_STORAGE_BUCKET
- FIREBASE_MESSAGING_SENDER_ID
- FIREBASE_APP_ID
- FIREBASE_MEASUREMENT_ID (opcional)

### Vercel

Em **Project Settings → Environment Variables**, cadastre as variáveis acima.

O projeto já contém `vercel.json` com:

```text
npm run build
```

Durante o build, `scripts/generate-firebase-config.mjs` cria `links/firebase-config.js`.

### Netlify

Cadastre as mesmas variáveis em **Site configuration → Environment variables**.

O `netlify.toml` já configura `npm run build`.

### Firebase Authentication

Ative somente **Email/Password** em Authentication → Sign-in method.

Não existe cadastro no site. Os usuários devem ser criados manualmente no Firebase Authentication.

### Firestore

Publique o conteúdo de `firestore.rules` em Firestore Database → Rules.

As regras permitem acesso aos documentos somente quando o `userId` do documento é igual ao UID do usuário autenticado.

### Importante

A configuração Web do Firebase é uma configuração de cliente: mesmo quando não está no HTML/repositório, qualquer configuração necessária ao SDK acaba chegando ao navegador no momento da execução. Isso não deve ser tratado como uma senha. A proteção real está no Authentication, nas Security Rules e, para proteção adicional contra abuso, no App Check.

Nunca coloque service account JSON, chaves privadas ou credenciais administrativas no frontend.

### Desenvolvimento local

1. Instale Node.js.
2. Copie `.env.example` para `.env`.
3. Preencha os valores do Firebase.
4. Execute `npm run build`.
5. Sirva a pasta por um servidor local (por exemplo, Live Server).

Não envie `.env` nem `links/firebase-config.js` para o Git.
