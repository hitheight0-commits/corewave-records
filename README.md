# COREWAVE RECORDS

A next-generation music streaming and distribution platform built with Next.js, empowering artists to upload, distribute, and evolve their sound.

## 🎵 Features

- **Artist-Centric Platform**: Upload tracks, manage profiles, and build your fanbase
- **AI-Generated Content Support**: Tag and showcase AI-generated music with distinctive badges
- **Advanced Audio Player**: Seamless playback with queue management, shuffle, and repeat modes
- **Verification System**: Earn blue badges through profile completion and approved releases
- **Social Features**: Follow artists, like tracks, create playlists
- **Admin Dashboard**: Content moderation and artist management
- **Secure Authentication**: NextAuth-powered login and signup

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Prisma ORM with SQLite
- **Authentication**: NextAuth.js
- **Styling**: CSS Modules with modern design system
- **State Management**: Zustand
- **Icons**: Lucide React

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/hitheight0-commits/corewave-records.git
cd corewave-records
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Update `.env` with your configuration (see `.env.example` for details)

4. Initialize the database
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Setup

The project uses Prisma with SQLite. To reset the database:

```bash
npx prisma migrate reset
npx prisma db push
```

## 🎨 Features Overview

### For Artists
- Upload and manage tracks
- Profile customization with images and bio
- Track analytics and play counts
- Verification protocol (Image + Bio + 10 Approved Tracks)

### For Listeners
- Browse and discover music
- Create and manage playlists
- Follow favorite artists
- Immersive fullscreen player

### For Admins
- Review and approve/reject submissions
- Manage artists and users
- Platform oversight dashboard

## 📝 Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL`: Database connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth session encryption
- `NEXTAUTH_URL`: Base URL of your application

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

The project is optimized for Vercel deployment with automatic builds and previews.

## 📄 License

MIT License - feel free to use this project for your own music platform!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ for artists and music lovers everywhere.
