# <p align="center"><img src="client/src/app/icon.svg" width="80" alt="The Professor Logo"><br>The Professor</p>

<!-- <p align="center"> -->
  ![The Professor Banner](https://readme-typing-svg.demolab.com?font=Fira+Code&size=45&pause=1000&color=3B82F6&center=true&vCenter=true&width=1000&height=100&lines=THE+PROFESSOR;AI+DOCUMENT+INTELLIGENCE;NEURAL+KNOWLEDGE+EXTRACTION)
<!-- </p> -->

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-blue?style=for-the-badge&logo=vercel)](https://the-professor-breaking-bad.vercel.app/)
[![API Status](https://img.shields.io/badge/API-Render-green?style=for-the-badge&logo=render)](https://the-professor.onrender.com)

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Aimmyy AI](https://img.shields.io/badge/Powered_by-Aimmyy_AI-213448?style=for-the-badge&logoColor=white)](https://github.com/)
[![Creator](https://img.shields.io/badge/Project_by-Zarak_K.-547792?style=for-the-badge)](https://github.com/)

</div>

---

## Overview

**The Professor** is an AI-powered document intelligence and active learning platform created by **Zarak K.** It transforms dense, complex PDFs—such as university textbooks, research papers, and technical specifications—into interactive, structured learning workspaces. 

Powered by **Aimmyy AI** with automated multi-tier fallback resilience, The Professor provides grounded conversational dialogue, auto-generated mastery quizzes, active recall flashcards, and interactive concept relationship graphs.

---

## Key Features

- 🎓 **Interactive Document Workspace**: Upload any academic or technical PDF to generate structured overviews, executive summaries, and AI readiness metrics.
- ⚡ **Instant Guest Mode**: Try all features immediately with zero friction. Guests receive an isolated session workspace that can seamlessly be promoted to a permanent account upon registration.
- 💬 **Contextual Grounded Chat**: Converse with documents using page-grounded retrieval. Answers reference source material without hallucinations.
- 📝 **Intelligent Quiz Generation**: Automatically generates multiple-choice quizzes with detailed rationales and instant score evaluation.
- 🗂️ **Active Recall Flashcards**: Interactive 3D flip card decks designed for spaced repetition and retention mastery.
- 🕸️ **Concept Knowledge Visualizer**: Explores documents as interconnected topic clusters and conceptual dependency graphs.
- 🎨 **Academic Hybrid Design System**: Curated with Oxford Navy (`#213448`), Slate Steel (`#547792`), Powder Frost (`#94B4C1`), and Parchment Cream (`#EAE0CF`) for a serene, high-focus learning environment.
- 🛡️ **Zero Client-Side Text Leakage**: Raw document text is loaded securely server-side; clients never expose sensitive context to endpoints.

---

## Architecture & Workflow

The platform organizes resources under a document-centric hierarchy with dual authentication flows (Guest & Supabase Authenticated):

```
Visitor
  ├── Try as Guest ──► Ephemeral Workspace (/documents/[id]) ──► Promote to Permanent Account
  └── Sign In / Register (Supabase Auth)
        └── User Dashboard (/documents)
              └── Document Workspace (/documents/[id])
                    ├── 📄 Overview & Executive Summary
                    ├── 💬 Grounded AI Chat (/documents/:id/chat)
                    ├── 📝 Practice Quiz (/documents/:id/quiz)
                    ├── 🗂️ 3D Flashcards (/documents/:id/flashcards)
                    └── 🕸️ Concept Visualizer (/documents/:id/visualize)
```

---

## RESTful API Surface

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/guest` | Initialize ephemeral guest session | No |
| `POST` | `/api/auth/register` | Register a new user via Supabase | No |
| `POST` | `/api/auth/login` | Log in and receive session token | No |
| `GET` | `/api/auth/me` | Fetch current user/guest profile | Yes (Bearer) |
| `GET` | `/api/documents` | List all documents owned by user | Yes (Bearer) |
| `POST` | `/api/documents` | Upload PDF, parse text & generate summary | Yes (Bearer) |
| `GET` | `/api/documents/:id` | Get document details & feature readiness | Yes (Bearer) |
| `GET` | `/api/documents/:id/chat` | Retrieve document chat history | Yes (Bearer) |
| `POST` | `/api/documents/:id/chat` | Ask question and receive grounded AI answer | Yes (Bearer) |
| `GET` | `/api/documents/:id/quiz` | Retrieve generated quiz questions | Yes (Bearer) |
| `POST` | `/api/documents/:id/quiz` | Generate or regenerate custom quiz | Yes (Bearer) |
| `GET` | `/api/documents/:id/flashcards` | Retrieve flashcard deck | Yes (Bearer) |
| `POST` | `/api/documents/:id/flashcards` | Generate or regenerate flashcard deck | Yes (Bearer) |
| `GET` | `/api/documents/:id/visualize` | Retrieve concept knowledge graph | Yes (Bearer) |
| `POST` | `/api/documents/:id/visualize` | Generate topic map & connections | Yes (Bearer) |

---

## Tech Stack

### Frontend (`/client`)
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Tailwind CSS & Academic Hybrid Design Tokens
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown & Code**: `react-markdown` & syntax highlighting

### Backend (`/server`)
- **Engine**: Node.js & [Express v5](https://expressjs.com/)
- **Language**: TypeScript (`ts-node-dev` for hot-reload)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Mongoose ODM)
- **Authentication**: [Supabase Auth](https://supabase.com/) & Guest Session tokens
- **PDF Extraction**: `pdf-parse`

### AI Architecture
- **Engine**: Powered by **Aimmyy AI**
- **Fallback Resilience**: Dual-provider automated fallback with latency and error recovery
- **Context Injection**: Document text stored server-side and dynamically scoped per query

---

## Deployment Guide

### Deploying Frontend to Vercel

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete project ready for deployment"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** &rarr; **"Project"**.
   - Select your GitHub repository (`professor-ai` / `the-professor`).

3. **Configure Build & Project Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`client`**
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variables in Vercel**:
   | Variable | Value / Description |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | Your production backend URL (e.g. `https://your-api.onrender.com/api`) |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (`https://xyz.supabase.co`) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous public key |

5. Click **"Deploy"**!

---

### Deploying Backend to Render / Railway / Cloud

1. **Create a Web Service** (e.g. on [Render](https://render.com)):
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

2. **Add Environment Variables**:
   | Variable | Value |
   | :--- | :--- |
   | `PORT` | `5001` (or provider `$PORT`) |
   | `MONGODB_URI` | `mongodb+srv://<username>:<password>@cluster.mongodb.net/the-professor` |
   | `GEMINI_API_KEY` | Your Aimmyy AI primary API key |
   | `GROQ_API_KEY` | Your Aimmyy AI secondary fallback key |
   | `SUPABASE_URL` | `https://xyz.supabase.co` |
   | `SUPABASE_ANON_KEY` | Your Supabase anon public key |
   | `CLIENT_URL` | Your Vercel frontend URL (e.g. `https://your-app.vercel.app`) |

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB instance (local or free MongoDB Atlas cluster)
- Aimmyy AI / Gemini & Groq API keys
- Supabase project (for authentication)

### 1. Clone & Setup
```bash
git clone https://github.com/your-username/professor-ai.git
cd professor-ai
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env   # configure your keys in .env
npm run dev
```
Backend will start on `http://localhost:5001`.

### 3. Frontend Setup
```bash
cd ../client
npm install
cp .env.example .env.local   # configure API URL and Supabase
npm run dev
```
Frontend will open on `http://localhost:3000`.

---

## Security Best Practices

- **Strict IDOR Mitigation**: Document queries use `findByDocAndUser(docId, userId)` ensuring absolute data isolation.
- **Header Token Validation**: All authenticated endpoints verify Bearer tokens with Supabase and custom guest session handlers.
- **Whitelisted CORS**: Backend rejects unauthorized origins; production allows strictly configured `CLIENT_URL`.
- **Payload Limits**: `1MB` body parser limits to protect against memory exhaustion attacks.

---

## Author & Attribution

- **Creator & Lead Developer**: **Zarak K.**
- **AI Core**: Powered by **Aimmyy AI**
- **License**: ISC License
