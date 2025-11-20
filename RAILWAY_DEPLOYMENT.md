# Railway Deployment Guide

This guide will help you deploy the YouTube Transcription Backend to Railway.

## Prerequisites

1. A Railway account ([railway.app](https://railway.app))
2. A GitHub account with this repository
3. MongoDB database (can use Railway's MongoDB service or external)
4. OpenAI API key
5. YouTube Data API key

## Step-by-Step Deployment

### 1. Connect Repository to Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account
5. Select the repository: `YOUTUBE_TRANSCRIPTION_BACKEND`
6. Railway will automatically detect the Dockerfile and start building

### 2. Configure Environment Variables

In your Railway project dashboard:

1. Go to your project
2. Click on the service
3. Navigate to **"Variables"** tab
4. Add the following environment variables:

#### Required Variables:

```env
DB_URL=mongodb://mongo:IbFUGRizgrkHqkSUCEvSBimbBXKPhGxM@centerbeam.proxy.rlwy.net:18432
OPENAI_API_KEY=sk-proj-your-openai-api-key
YOUTUBE_API_KEY=your-youtube-api-key
JWT_SECRET=your-very-secure-random-secret-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

#### Optional Variables:

```env
PORT=3000  # Railway sets this automatically, but you can override
CRON_SCHEDULE=0 3 * * *  # Daily at 3 AM (default)
```

**Important Notes:**
- Railway automatically sets the `PORT` environment variable
- Never commit `.env` files to Git
- Use Railway's Variables tab for all sensitive data

### 3. Deploy

1. Railway will automatically build and deploy when you:
   - Push to the main branch
   - Add environment variables
   - Manually trigger a deployment

2. Monitor the deployment:
   - Go to **"Deployments"** tab
   - Watch the build logs
   - Check for any errors

### 4. Verify Deployment

1. Once deployed, Railway will provide a URL (e.g., `https://your-app.railway.app`)
2. Test the health endpoint:
   ```bash
   curl https://your-app.railway.app/api
   ```

3. Test authentication:
   ```bash
   curl -X POST https://your-app.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"CMPO","password":"Cmpo123@#$"}'
   ```

### 5. Seed Super Admin User

After first deployment, you need to seed the super admin user:

**Option 1: Using Railway CLI**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run the seed script
railway run npm run seed:super-admin
```

**Option 2: Using Railway Dashboard**

1. Go to your service
2. Click **"Connect"** or **"Shell"**
3. Run:
   ```bash
   npm run seed:super-admin
   ```

### 6. Configure Custom Domain (Optional)

1. In Railway dashboard, go to **"Settings"**
2. Click **"Generate Domain"** or add a custom domain
3. Railway will provide SSL certificates automatically

## Troubleshooting

### Build Fails

- Check build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify Dockerfile syntax

### Application Won't Start

- Check application logs in Railway
- Verify all environment variables are set
- Ensure MongoDB connection string is correct
- Check if PORT is being read correctly

### Database Connection Issues

- Verify `DB_URL` is set correctly
- Check MongoDB service is running (if using Railway MongoDB)
- Ensure MongoDB allows connections from Railway's IPs
- Test connection string locally first

### Environment Variables Not Loading

- Railway uses environment variables, not `.env` files
- Ensure variables are set in Railway dashboard
- Restart the service after adding variables
- Check variable names match exactly (case-sensitive)

## Monitoring

### View Logs

1. Go to your service in Railway
2. Click **"Logs"** tab
3. View real-time application logs

### Metrics

Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Request metrics

## Updating the Application

1. Push changes to your GitHub repository
2. Railway automatically detects changes
3. Triggers a new build and deployment
4. Zero-downtime deployment (Railway handles this)

## Scaling

Railway automatically scales based on traffic. For manual scaling:

1. Go to service settings
2. Adjust resources (CPU, Memory)
3. Railway handles the rest

## Cost Optimization

- Railway offers a free tier with $5 credit
- Monitor usage in dashboard
- Set up usage alerts
- Optimize Docker image size (already done with multi-stage build)

## Security Best Practices

1. ✅ Never commit `.env` files
2. ✅ Use strong `JWT_SECRET` (generate with: `openssl rand -base64 32`)
3. ✅ Keep API keys secure in Railway Variables
4. ✅ Enable Railway's built-in security features
5. ✅ Regularly update dependencies

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: GitHub Issues

