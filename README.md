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

**The Professor** is an AI-powered document intelligence platform created by **Zarak K.**, designed to transform static academic and technical PDFs into interactive, conversational learning workspaces. Powered by **Aimmyy AI** with automated multi-tier fallback resilience, it provides deep document summaries, isolated user workspaces, contextual AI dialogue, interactive quizzes, active recall flashcards, and topic visualizations.

---

## Architecture & RESTful API Structure

The platform organizes study resources under a document-centric hierarchy:

```
User (Authenticated via Supabase)
  └── Documents (/api/documents)
        └── Document Workspace (/documents/[id])
              ├── Overview & Summary
              ├── Contextual Chat (/api/documents/:id/chat)
              ├── Practice Quiz (/api/documents/:id/quiz)
              ├── Flashcards (/api/documents/:id/flashcards)
              └── Topic Visualizer (/api/documents/:id/visualize)
```

### Complete API Surface

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in and receive session token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/documents` | List all documents owned by user | Yes |
| `POST` | `/api/documents` | Upload PDF, extract text & create document | Yes |
| `GET` | `/api/documents/:id` | Get document details & feature statuses | Yes |
| `GET` | `/api/documents/:id/chat` | Retrieve document chat history | Yes |
| `POST` | `/api/documents/:id/chat` | Send question and get AI response | Yes |
| `GET` | `/api/documents/:id/quiz` | Retrieve generated quiz questions | Yes |
| `POST` | `/api/documents/:id/quiz` | Generate or regenerate quiz | Yes |
| `GET` | `/api/documents/:id/flashcards` | Retrieve flashcard deck | Yes |
| `POST` | `/api/documents/:id/flashcards` | Generate or regenerate flashcards | Yes |
| `GET` | `/api/documents/:id/visualize` | Retrieve topic knowledge graph | Yes |
| `POST` | `/api/documents/:id/visualize` | Generate topic map & connections | Yes |

---

## Tech Stack

### Frontend
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: Tailwind CSS & Neo-Brutalist Design Tokens
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown**: `react-markdown`

### Backend
- **Engine**: Node.js & [Express v5](https://expressjs.com/)
- **Language**: TypeScript
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Authentication**: [Supabase Auth](https://supabase.com/)
- **PDF Extraction**: `pdf-parse`

### AI Services
- **Engine**: Powered by Aimmyy AI (`Aimmyy AI Intelligent Engine`)
- **Architecture**: Automated multi-tier fallback with provider latency and health tracking
- **Resilience**: High-availability document summarization, dialogue, and assessment

---

## Security Model

- **Token-Based Authentication**: Strict bearer token verification on all protected endpoints.
- **Ownership Verification**: Document-scoped queries (`findByDocAndUser`) prevent Insecure Direct Object References (IDOR).
- **Zero Client-Sent Document Text**: LLM context is loaded securely server-side from MongoDB; clients never transmit raw document text to feature endpoints.
- **CORS Protection**: Whitelisted origin policy (`localhost:3000` + configured `CLIENT_URL`).
- **Body Size Caps**: `1mb` JSON payload limit to mitigate DoS vectors.

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Instance (local or Atlas)
- Google Gemini API Key
- Groq API Key (for fallback)
- Supabase Project

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/the-professor.git
   cd the-professor
   ```

2. **Backend Setup**:
   ```bash
   cd server
   npm install
   # Configure environment variables in .env
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../client
   npm install
   # Configure environment variables in .env.local
   npm run dev
   ```

### Environment Variables

#### Backend (`server/.env`)
```env
PORT=5001
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
CLIENT_URL=http://localhost:3000
```

#### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## License

This project is licensed under the ISC License.
