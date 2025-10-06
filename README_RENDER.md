
# MapWorld PRO v3.1 for Render.com (Single Web Service)

This project serves the frontend (public/) and the AI endpoint **POST /api/ai-chat** with Express.

## Deploy on Render
1. In Render dashboard → New → **Web Service**
2. Select this folder (upload to a repo or Render CLI).
3. Environment: **Node**
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. **Environment Variables:** `OPENAI_API_KEY` = your key
7. Deploy → open the URL and click the 🤖 IA button to test.

If you want only static hosting, upload `public/` as a Static Site (the IA chat won't work).
