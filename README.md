# 🔍 CodeRev AI — Intelligent Code Review System

> Powered by **Groq LLaMA-3 · Next.js 14 · Monaco Editor · MongoDB · Vercel**

An AI-powered code review tool that analyzes your code, suggests improvements, and highlights issues — instantly.

🌐 **Live Demo:** [coderev-ai-ten.vercel.app](https://coderev-ai-ten.vercel.app)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **AI Code Review** | Groq LLaMA-3 analyzes code for bugs, style, and best practices |
| **Monaco Editor** | VS Code-style editor with syntax highlighting |
| **Diff Viewer** | Side-by-side comparison of original vs improved code |
| **Multi-language** | Supports JavaScript, TypeScript, Python, and more |
| **Persistent History** | Reviews saved to MongoDB |
| **Auth** | Secure authentication via JWT (jose) |

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **AI:** Groq SDK (LLaMA-3)
- **Editor:** Monaco Editor
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (jose)
- **Deployment:** Vercel

---

## 🚀 Run Locally

### 1 — Clone the repo
```bash
git clone https://github.com/KAVYA07-ux/coderev-ai.git
cd coderev-ai
```

### 2 — Install dependencies
```bash
npm install
```

### 3 — Set up environment variables
Create a `.env.local` file in the root:
```env
GROQ_API_KEY=your_groq_api_key
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4 — Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
coderev-ai/
├── src/
│   ├── app/           ← Next.js App Router pages
│   ├── components/    ← React components
│   ├── lib/           ← DB, auth, and API utilities
│   └── models/        ← Mongoose schemas
├── next.config.js     ← Next.js configuration
├── package.json       ← Dependencies
└── tsconfig.json      ← TypeScript config
```

---

## 🔑 Get Your Free API Keys

| Service | Get Key |
|---------|---------|
| **Groq** | [console.groq.com](https://console.groq.com) |
| **MongoDB** | [mongodb.com/atlas](https://www.mongodb.com/atlas) |

---

## 📦 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

---

## 👩‍💻 Author

**Kavya Mehndiratta** — [KAVYA07-ux](https://github.com/KAVYA07-ux)
