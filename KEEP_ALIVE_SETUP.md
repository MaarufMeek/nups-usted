# Keep Render Service Awake - Setup Guide

## Problem
Render's free tier services go to sleep after **15 minutes of inactivity**. When a user visits after the service has slept, the first request takes 30-60 seconds to wake up the service.

## Solution
Set up an external service to ping your health check endpoint every 10-14 minutes to keep the service active.

---

## Step 1: Health Check Endpoint

✅ **Already Created!**

Your backend now has a health check endpoint at:
- **URL**: `https://nupsapi.onrender.com/health/`
- **Method**: GET
- **Response**: `{"status": "healthy", "service": "NUPS API", "timestamp": "..."}`

You can test it by visiting: `https://nupsapi.onrender.com/health/`

---

## Step 2: Set Up External Ping Service

Choose one of these free services to ping your endpoint:

### Option 1: UptimeRobot (Recommended - Free, Reliable)

1. **Sign up**: Go to https://uptimerobot.com/ (free account)
2. **Add Monitor**:
   - Click "Add New Monitor"
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: NUPS API Keep Alive
   - **URL**: `https://nupsapi.onrender.com/health/`
   - **Monitoring Interval**: 5 minutes (free tier allows this)
   - Click "Create Monitor"

3. **Done!** UptimeRobot will ping your endpoint every 5 minutes, keeping your service awake.

### Option 2: cron-job.org (Free)

1. **Sign up**: Go to https://cron-job.org/ (free account)
2. **Create Cron Job**:
   - Click "Create cronjob"
   - **Title**: NUPS API Keep Alive
   - **Address**: `https://nupsapi.onrender.com/health/`
   - **Schedule**: Every 10 minutes (`*/10 * * * *`)
   - Click "Create cronjob"

3. **Done!** The cron job will ping your endpoint every 10 minutes.

### Option 3: EasyCron (Free Tier)

1. **Sign up**: Go to https://www.easycron.com/ (free account)
2. **Create Cron Job**:
   - Click "Add Cron Job"
   - **URL**: `https://nupsapi.onrender.com/health/`
   - **Schedule**: Every 10 minutes
   - Click "Add"

---

## Step 3: Verify It's Working

1. **Test the endpoint manually**:
   ```bash
   curl https://nupsapi.onrender.com/health/
   ```
   Should return: `{"status": "healthy", "service": "NUPS API", "timestamp": "..."}`

2. **Check Render logs**:
   - Go to your Render dashboard
   - Click on your service → "Logs"
   - You should see GET requests to `/health/` every 10-14 minutes

3. **Test after waiting**:
   - Wait 20+ minutes
   - Visit your site
   - If it loads immediately (no 30-60 second delay), the keep-alive is working!

---

## How It Works

1. **External service** (UptimeRobot, cron-job.org, etc.) pings your `/health/` endpoint
2. **Render service** receives the request and stays awake
3. **Your users** get instant responses instead of waiting for the service to wake up

---

## Important Notes

- **Free tier limits**: Render free tier allows 750 hours/month. Pinging every 10 minutes = ~4,320 requests/month (well within limits)
- **Cost**: All the services mentioned above have free tiers that are sufficient for this use case
- **Frequency**: Ping every 10-14 minutes (Render sleeps after 15 minutes of inactivity)
- **Multiple endpoints**: You can ping both `/health/` and `/api/health/` if you want redundancy

---

## Alternative: Render Cron Jobs (If Available)

If Render offers cron jobs on your plan:
1. Go to Render dashboard → Your service
2. Add a cron job that runs every 10 minutes
3. Command: `curl https://nupsapi.onrender.com/health/`

---

## Troubleshooting

**Service still sleeping?**
- Check that the ping service is actually running
- Verify the URL is correct: `https://nupsapi.onrender.com/health/`
- Check Render logs to see if requests are coming in
- Make sure the ping interval is less than 15 minutes

**Getting errors?**
- Make sure your service is deployed and running
- Check that the `/health/` endpoint is accessible
- Verify your Render service URL is correct

---

## Summary

✅ Health check endpoint created at `/health/`  
✅ Set up UptimeRobot or cron-job.org to ping it every 10 minutes  
✅ Your service will stay awake 24/7!  

**Recommended**: Use **UptimeRobot** - it's free, reliable, and easy to set up.

