# 🚀 Deployment Guide - AI-Powered Diagram Builder

## Frontend Deployment with AWS Amplify Hosting

### Prerequisites
- AWS Account with Amplify permissions
- GitHub repository access
- Node.js 18+ installed

### 🎯 Quick Setup (AWS Console - Recommended)

#### Step 1: Access AWS Amplify Console
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"Create new app"** → **"Host web app"**

#### Step 2: Connect GitHub Repository
1. Choose **"GitHub"** as source
2. Authorize AWS Amplify to access your GitHub account
3. Select repository: `koralkulacoglu/sematic`
4. Select branch: `main` (or your deployment branch)

#### Step 3: Configure Build Settings
The `amplify.yml` file is already configured. Verify these settings:

```yaml
version: 1
applications:
  - appRoot: frontend
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: build
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
```

#### Step 4: Advanced Settings
- **App name**: `sematic-frontend`
- **Environment**: `production`
- **Build timeout**: 15 minutes
- **Node version**: 18

#### Step 5: Deploy
1. Click **"Save and deploy"**
2. Wait for build to complete (~5-10 minutes)
3. Get your live URL: `https://[branch].[app-id].amplifyapp.com`

### 🔧 Environment Variables (if needed)
If you need to add environment variables:
1. Go to App Settings → Environment variables
2. Add any required variables for production

### 🔄 Auto-Deployment
Once connected, every push to your main branch will automatically:
1. Trigger a new build
2. Deploy to your live URL
3. Invalidate CDN cache

### 📱 Multiple Environments
To set up staging/development environments:
1. Connect additional branches (e.g., `develop`, `staging`)
2. Each branch gets its own URL
3. Configure different environment variables per branch

### 🛠️ Alternative: CLI Deployment

If you have AWS CLI configured with proper permissions:

```bash
# Create Amplify app
aws amplify create-app \
  --name "sematic-frontend" \
  --description "AI-Powered Diagram Builder Frontend" \
  --repository "https://github.com/koralkulacoglu/sematic" \
  --platform "WEB" \
  --region us-west-2

# Create branch connection
aws amplify create-branch \
  --app-id [APP_ID] \
  --branch-name main \
  --description "Production branch"

# Start deployment
aws amplify start-job \
  --app-id [APP_ID] \
  --branch-name main \
  --job-type RELEASE
```

### 🎯 Production Checklist
- [ ] Repository connected to Amplify
- [ ] Build completes successfully
- [ ] Authentication works on live URL
- [ ] All routes accessible
- [ ] Performance optimized
- [ ] Custom domain configured (optional)

### 📋 Build Configuration Details

**Frontend Build Process:**
1. **Pre-build**: Install dependencies with `npm ci`
2. **Build**: Run `npm run build` to create production build
3. **Artifacts**: Deploy `build/` folder contents
4. **Cache**: Cache `node_modules` for faster builds

**Build Time**: ~3-5 minutes
**Auto-deploy**: On every push to connected branch
**CDN**: Global CloudFront distribution included

### 🔗 Custom Domain (Optional)
1. In Amplify Console → Domain management
2. Add your custom domain
3. Configure DNS records as shown
4. SSL certificate automatically provisioned

### 📊 Monitoring
- **Build logs**: Available in Amplify Console
- **Performance**: CloudWatch metrics included
- **Errors**: Real-time monitoring and alerts

---

## 🚨 Current Status
✅ Build configuration ready (`amplify.yml`)
✅ Frontend optimized for deployment  
✅ Authentication configured for production
⏳ Awaiting AWS permissions for deployment

**Next Step**: An admin user needs to create the Amplify app using the AWS Console method above.