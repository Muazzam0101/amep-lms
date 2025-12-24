# NeuroLearn Backend Deployment Instructions

## Deploy to Render

1. **Create Render Account**: Go to https://render.com and sign up

2. **Create New Web Service**:
   - Connect your GitHub repository
   - Select the `backend` folder as root directory
   - Use these settings:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: Node

3. **Add Environment Variables**:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Generate a secure random string
   - `DB_PATH`: `/opt/render/project/src/data/amep.db`

4. **Add Persistent Disk**:
   - Name: `sqlite-data`
   - Mount Path: `/opt/render/project/src/data`
   - Size: 1GB

5. **Deploy**: Click "Create Web Service"

## Update Frontend Environment

After backend is deployed, update the frontend environment:

1. Copy the Render URL (e.g., `https://neurolearn-backend.onrender.com`)
2. Update `.env.production`:
   ```
   REACT_APP_API_URL=https://your-app-name.onrender.com/api
   ```
3. Redeploy frontend to Vercel

## Test Cross-Device Login

1. **Device A**: Sign up with new account
2. **Device B**: Login with same credentials
3. **Verify**: Both devices should access same user data

## Alternative: Railway Deployment

If Render doesn't work, use Railway:

1. Go to https://railway.app
2. Connect GitHub repo
3. Select backend folder
4. Add environment variables
5. Deploy

The SQLite database will persist across deployments.