# ConvoAI – Modern AI Chat Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org/)

A production-ready AI chat application built with Next.js, featuring multi-model support, real-time streaming, persistent chat history, and a modern, responsive UI.

![ConvoAI Screenshot](./public/screenshot.png)

## ✨ Key Features

### 🤖 AI-Powered Conversations
- **Multi-Model Support**: Access 100+ AI models via OpenRouter (GPT-4, Claude, Llama, and more)
- **Real-Time Streaming**: Instant response streaming with Server-Sent Events
- **Context-Aware**: Maintains conversation history for coherent multi-turn chats
- **Smart System Prompts**: Optimized prompts for coding, debugging, and general assistance

### 💬 Chat Management
- **Persistent History**: All conversations saved to PostgreSQL with Prisma ORM
- **Chat Organization**: Search, filter, and manage multiple conversations
- **Quick Actions**: Delete, rename, and navigate chats seamlessly
- **Welcome Suggestions**: AI-powered conversation starters

### 🔐 Authentication & Security
- **Session-Based Auth**: Secure token-based authentication with httpOnly cookies
- **Multi-Provider Ready**: Extensible architecture for OAuth providers
- **Protected Routes**: API route protection with middleware
- **Account Management**: User profiles and session management

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Automatic theme switching with next-themes
- **30+ AI Components**: Rich UI elements including reasoning panels, code blocks, tool UIs
- **Smooth Animations**: Motion-powered transitions and micro-interactions
- **Toast Notifications**: Real-time feedback with Sonner

### ⚡ Performance
- **App Router**: Next.js 16 App Router with React Server Components
- **Streaming Architecture**: Efficient data flow with AI SDK streaming
- **Database Optimization**: Indexed queries and connection pooling
- **Client-Side Caching**: TanStack Query for optimal data fetching

## 🏗️ Architecture

```
convo-ai/
├── app/                     # Next.js App Router
│   ├── (root)/             # Main layout group
│   ├── (auth)/             # Auth pages (login, signup)
│   ├── api/                # API routes
│   │   ├── chat/          # Chat streaming endpoint
│   │   ├── ai/            # AI model management
│   │   └── auth/          # Authentication handlers
│   └── layout.tsx         # Root layout with providers
├── components/            # React components
│   ├── ai-elements/      # 30+ AI UI components
│   ├── providers/        # Context providers
│   └── ui/              # Base UI components (Radix + Tailwind)
├── modules/              # Feature modules
│   ├── auth/            # Authentication logic
│   ├── chat/            # Chat feature (store, hooks, components)
│   └── messages/        # Message handling
├── lib/                 # Utilities and configurations
│   ├── auth.ts         # Auth utilities
│   ├── databaseConnection.ts  # Prisma client
│   └── prompt.ts       # AI system prompts
├── prisma/              # Database schema
└── types/               # TypeScript definitions
```

## 🚀 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16.1.1, React 19.2.3 |
| **Language** | TypeScript 5.0 |
| **Styling** | Tailwind CSS 4.0, CSS Variables |
| **UI Components** | Radix UI primitives |
| **State Management** | Zustand (client), React Query (server) |
| **Database** | PostgreSQL 15, Prisma ORM 7.2 |
| **AI Integration** | Vercel AI SDK 6.0, OpenRouter |
| **Auth** | Custom session-based (Better Auth pattern) |
| **Icons** | Lucide React |
| **Animations** | Motion (Framer Motion successor) |
| **Code Highlighting** | Shiki |

## 📦 Installation

### Prerequisites
- Node.js 20+ or Bun
- PostgreSQL 15+
- OpenRouter API key

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/convo-ai.git
cd convo-ai
bun install
```

### 2. Environment Setup

Create a `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/convoai"

# OpenRouter AI
OPENROUTER_API_KEY="your_openrouter_api_key"

# Auth
AUTH_SECRET="your_auth_secret_min_32_chars"
AUTH_URL="http://localhost:3000"

# Optional: Better Auth
BETTER_AUTH_SECRET="your_better_auth_secret"
```

### 3. Database Setup

```bash
# Generate Prisma client
bun prisma generate

# Run migrations
bun prisma migrate dev --name init

# (Optional) Seed data
bun prisma db seed
```

### 4. Start Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🛠️ Development

### Available Scripts

```bash
bun dev        # Start development server
bun build      # Production build
bun start      # Start production server
bun lint       # Run ESLint
```

### Project Structure Guidelines

- **App Router**: Use React Server Components by default, mark client components with `"use client"`
- **Components**: Co-locate related components in modules/
- **State**: Use Zustand for global state, React Query for server state
- **Database**: Always use Prisma client from `lib/databaseConnection.ts`

### Adding New AI Models

Models are fetched dynamically from OpenRouter. To add custom models, update the model configuration in:

```typescript
// app/api/ai/get-models/route.ts
```

## 🎯 Core Features Explained

### Real-Time Chat Streaming

The chat API uses Vercel AI SDK's `streamText` for efficient streaming:

```typescript
// app/api/chat/route.ts
const result = streamText({
  model: provider.chat(model),
  system: CHAT_SYSTEM_PROMPT,
  messages: modelMessages,
});

return result.toUIMessageStreamResponse({
  sendReasoning: true,
  onFinish: async ({ responseMessage }) => {
    // Persist to database
    await prisma.message.createMany({...});
  },
});
```

### Authentication Flow

1. User logs in via auth pages
2. Server validates credentials and creates session
3. Session token stored in httpOnly cookie
4. Middleware validates token on protected routes
5. Server components access user via `getCurrentUser()`

### Database Schema

```prisma
// Core entities
User → Chat → Message
User → Session
User → Account (OAuth)
```

- **Indexed queries** on `chat(userId, updatedAt)` for fast chat listing
- **Cascading deletes** for data consistency
- **Soft deletes** can be implemented for message history

## 🧪 Testing Strategy

### Unit Tests (Recommended)
```bash
# Add testing dependencies
bun add -d vitest @testing-library/react @testing-library/jest-dom

# Run tests
bun test
```

### E2E Tests (Recommended)
```bash
# Add Playwright
bun add -d @playwright/test
npx playwright install

# Run E2E tests
bun playwright test
```

## 📈 Performance Optimizations

1. **Streaming Architecture**: Reduces TTFB (Time to First Byte)
2. **React Server Components**: Zero client-side JavaScript for static content
3. **Database Connection Pooling**: Efficient PostgreSQL connections via Prisma
4. **Image Optimization**: Next.js Image component with lazy loading
5. **Code Splitting**: Automatic route-based code splitting

## 🔒 Security Considerations

- ✅ **HttpOnly Cookies**: Prevents XSS attacks on auth tokens
- ✅ **Input Validation**: Zod schemas for all API inputs
- ✅ **SQL Injection Prevention**: Prisma ORM parameterized queries
- ✅ **CORS Configuration**: Restricted to known origins
- ✅ **Rate Limiting**: (Recommended) Add Redis-based rate limiting

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Environment variables in Vercel dashboard:
- `DATABASE_URL` (use Vercel Postgres or Neon)
- `OPENROUTER_API_KEY`
- `AUTH_SECRET`
- `AUTH_URL`

### Docker

```dockerfile
# Dockerfile
FROM oven/bun:1 as builder
WORKDIR /app
COPY . .
RUN bun install
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["bun", "server.js"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

## 📋 Roadmap

- [ ] File attachments support (images, PDFs)
- [ ] Voice input/output
- [ ] Multi-modal AI (image generation)
- [ ] Collaborative chats
- [ ] Mobile app (React Native)
- [ ] Plugin system for custom AI tools
- [ ] Analytics dashboard

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai/) for the excellent streaming infrastructure
- [OpenRouter](https://openrouter.ai/) for unified AI model access
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Shadcn UI](https://ui.shadcn.com/) for design inspiration

---

Built with ❤️ by [Akhil](https://github.com/Akhilesh-Chandewar)

**Star ⭐ this repo if you find it helpful!**
