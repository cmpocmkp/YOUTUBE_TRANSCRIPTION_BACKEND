# YouTube Transcription & Political Sentiment Analysis Backend

A NestJS backend application that automatically transcribes YouTube videos and performs political sentiment analysis using OpenAI.

## Features

- 🔐 JWT-based authentication with role-based access control (super_admin, admin, user)
- 📺 YouTube video fetching and monitoring
- 🎙️ Audio transcription using OpenAI Whisper
- 🧠 Political sentiment analysis using OpenAI LLM
- ⏰ Automated daily cron jobs for video processing
- 📊 RESTful API for managing YouTubers, videos, and analysis
- 🗄️ MongoDB for data storage

## Prerequisites

- Node.js 18+ 
- MongoDB database (local or remote)
- OpenAI API key
- YouTube Data API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_URL=mongodb://your-mongodb-connection-string

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# YouTube API Configuration
YOUTUBE_API_KEY=your_youtube_api_key

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# Cron Schedule (default: daily at 3 AM)
CRON_SCHEDULE=0 3 * * *
```

## Local Development

### Installation

```bash
npm install
```

### Run the application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### Seed Super Admin User

```bash
npm run seed:super-admin
```

This creates a super admin user with:
- Email: `CMPO`
- Password: `Cmpo123@#$`
- Role: `super_admin`

## Docker

### Build and run with Docker

```bash
# Build the image
docker build -t youtube-transcription-backend .

# Run the container
docker run -p 3000:3000 --env-file .env youtube-transcription-backend
```

### Using Docker Compose

```bash
docker-compose up -d
```

## Railway Deployment

### Prerequisites

1. Railway account
2. Railway CLI installed (optional)

### Deployment Steps

1. **Connect your GitHub repository to Railway:**
   - Go to [Railway](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Set Environment Variables in Railway:**
   - Go to your project settings
   - Navigate to "Variables"
   - Add all required environment variables:
     - `DB_URL` - Your MongoDB connection string
     - `OPENAI_API_KEY` - Your OpenAI API key
     - `YOUTUBE_API_KEY` - Your YouTube Data API key
     - `JWT_SECRET` - A secure random string
     - `JWT_EXPIRES_IN` - Token expiration (default: `7d`)
     - `PORT` - Port number (Railway sets this automatically)
     - `NODE_ENV` - Set to `production`
     - `CRON_SCHEDULE` - Cron schedule (optional, default: `0 3 * * *`)

3. **Deploy:**
   - Railway will automatically detect the Dockerfile
   - It will build and deploy your application
   - The deployment will start automatically

4. **Seed Super Admin (after first deployment):**
   - Connect to your Railway instance via CLI or SSH
   - Run: `npm run seed:super-admin`

### Railway Configuration

The `railway.json` file configures Railway to:
- Use the Dockerfile for building
- Start the application with `node dist/main.js`
- Automatically restart on failure

## API Endpoints

See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for complete API documentation.

### Quick Start

1. **Login:**
   ```bash
   POST /api/auth/login
   {
     "email": "CMPO",
     "password": "Cmpo123@#$"
   }
   ```

2. **Use the access token:**
   ```bash
   Authorization: Bearer <your-access-token>
   ```

## Project Structure

```
src/
├── auth/              # Authentication & authorization
├── users/             # User management
├── youtubers/         # YouTuber/channel management
├── videos/            # Video data & analysis
├── youtube/           # YouTube API integration
├── transcription/     # OpenAI Whisper integration
├── analysis/          # Sentiment analysis
├── cron/              # Scheduled jobs
└── common/            # Shared utilities & config
```

## Technologies

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **OpenAI** - Whisper & GPT for transcription and analysis
- **JWT** - JSON Web Tokens for authentication
- **Passport** - Authentication middleware
- **bcrypt** - Password hashing

## License

MIT

