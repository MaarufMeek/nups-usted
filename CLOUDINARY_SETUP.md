# Cloudinary Setup for Media Files on Render

## Why Cloudinary?
Render's filesystem is **ephemeral** - files in `/media/` get deleted on every deployment. Cloudinary provides persistent cloud storage that survives deployments.

## Setup Steps

### 1. Create a Cloudinary Account (Free Tier Available)
1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account
3. After signup, you'll see your **Dashboard** with:
   - **Cloud Name** (e.g., `dxyz1234`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

### 2. Add Environment Variables to Render
In your Render dashboard for the `nupsApi` service:

1. Go to **Environment** tab
2. Add these environment variables:
   ```
   USE_CLOUDINARY=true
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

### 3. Redeploy
After adding the environment variables, Render will automatically redeploy. Your media files will now be stored in Cloudinary and persist across deployments!

## How It Works
- **Development (local)**: Files stored in `media/` folder (local filesystem)
- **Production (Render)**: Files stored in Cloudinary cloud storage
- The code automatically switches based on the `USE_CLOUDINARY` environment variable

## Testing
1. Upload a new profile with an image on Render
2. The image should now persist even after redeployment
3. Check Cloudinary dashboard to see uploaded files

## Free Tier Limits
- 25 GB storage
- 25 GB monthly bandwidth
- Perfect for most small-to-medium applications

