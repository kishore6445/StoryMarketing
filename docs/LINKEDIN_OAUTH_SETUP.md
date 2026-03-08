# LinkedIn OAuth Setup Guide

## Overview
The Story Marketing OS uses OAuth 2.0 to securely connect to LinkedIn company pages for scheduling and publishing posts.

## Environment Variables Required

Add these to your `.env.local` file or Vercel project settings:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Your app URL
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
```

## Step-by-Step Setup

### 1. Create a LinkedIn App

1. Go to https://www.linkedin.com/developers/apps
2. Click "Create app"
3. Fill in the required fields:
   - **App name**: Story Marketing OS
   - **LinkedIn Page**: Select your company page
   - **App logo**: Upload your logo
   - **Legal agreement**: Accept the terms
4. Click "Create app"

### 2. Configure OAuth Settings

1. In your app's **Auth** tab:
   - Add Authorized redirect URLs:
     - `http://localhost:3000/api/auth/linkedin/callback` (for development)
     - `https://yourdomain.com/api/auth/linkedin/callback` (for production)
   - Note your **Client ID** and **Client Secret**

### 3. Request Access to APIs

1. In the **Products** tab, request access to:
   - **Sign In with LinkedIn** - if you need user authentication
   - **Share on LinkedIn** - for posting to pages
   - **LinkedIn Marketing Developer Platform** - for company pages

2. Wait for LinkedIn approval (usually 24-48 hours)

### 4. Add Credentials to Your Project

#### For Vercel:
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` = your Client ID
   - `LINKEDIN_CLIENT_SECRET` = your Client Secret
   - `NEXT_PUBLIC_APP_URL` = your production URL

#### For Local Development:
Create `.env.local`:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
```

### 5. Test the Connection

1. Navigate to "Social Connections" in the sidebar
2. Click "Connect" on LinkedIn
3. You'll be redirected to LinkedIn for authorization
4. After authorization, you'll be redirected back to the app

## API Scope Details

The app requests these LinkedIn scopes:

- `r_liteprofile` - Read basic profile information
- `r_emailaddress` - Read email address
- `w_member_social` - Post on behalf of the user
- `r_organization_social` - Read organization posts

## Troubleshooting

### "redirect_uri mismatch" Error
- Make sure the redirect URI in your LinkedIn app settings **exactly** matches your actual callback URL
- Check for trailing slashes and protocol (http vs https)

### "Invalid Client ID" Error
- Verify you've copied the correct Client ID from LinkedIn
- Make sure the environment variable is set correctly

### "Permission Denied" Error
- LinkedIn may not have approved your app yet
- Check your app status in the LinkedIn Developer Portal
- Ensure your app has the necessary permissions requested

## Security Notes

- Never commit your `LINKEDIN_CLIENT_SECRET` to version control
- Always use HTTPS in production (redirects won't work with HTTP)
- Tokens are encrypted and stored securely in the database
- Access tokens automatically refresh before expiration

## Next Steps

Once LinkedIn is connected:
1. The app will automatically sync posts from all connected LinkedIn pages
2. You can schedule posts from the Distribution phase
3. Analytics will be collected and displayed in the Data phase
4. The Report Card will show LinkedIn performance metrics
