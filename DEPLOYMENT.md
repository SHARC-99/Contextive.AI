# Deployment Guide for Contextive.ai

This guide provides step-by-step instructions to host and deploy both the **ASP.NET Core Web API backend** and the **Angular UI frontend** so real users can access the application.

---

## Part 1: Deploying the Backend (.NET Core Web API)

The backend must be hosted first to obtain a public URL, which will then be configured in the frontend settings. We recommend using **Render** (free tier) or **Railway** (low cost).

### Option A: Hosting on Render (Free Tier)
1. **Sign up:** Go to [Render.com](https://render.com) and create an account using your GitHub credentials.
2. **Create Web Service:** Click **New +** and select **Web Service**.
3. **Connect Repository:** Connect your GitHub account and select your `Contextive.AI` repository.
4. **Configure Project Settings:**
   * **Name:** `contextive-api` (or any unique name).
   * **Environment:** `Docker` (Render will build from .NET if a Dockerfile is provided) or select `C# (.NET)` if supported in your region.
   * **Root Directory:** `Contextive.AI API/Contextive.AI/Contextive.AI` (points directly to the project folder containing the project files).
   * **Build Command:** `dotnet publish -c Release -o out`
   * **Start Command:** `dotnet out/Contextive.AI.dll --urls "http://0.0.0.0:10000"` (Render binds to port `10000` automatically).
5. **Configure Environment Variables:**
   * Under the **Environment** tab, click **Add Environment Variable**.
   * Add key: **`OpenAI__ApiKey`**
   * Add value: `[Your actual Gemini API Key starting with AIza...]`
   * *Note: The double underscore in `OpenAI__ApiKey` maps automatically to the nested `OpenAI:ApiKey` path in ASP.NET Core configurations.*
6. **Deploy:** Click **Create Web Service**. Render will build the backend and provide a public URL (e.g. `https://contextive-api.onrender.com`).

---

## Part 2: Deploying the Frontend (Angular UI)

We recommend using **Vercel** or **Netlify** for hosting static Angular single-page applications (SPA).

### Step 1: Update API URL in Code
Before building, you must change the frontend source code to point to your new public backend URL instead of `localhost`.
1. Open the file `Contextive.ai UI/src/app/upload/upload/upload.ts`.
2. Locate line 23:
   ```typescript
   private apiUrl = 'http://localhost:5286/Upload';
   ```
3. Change it to point to your deployed Render URL:
   ```typescript
   private apiUrl = 'https://your-backend-app.onrender.com/Upload';
   ```
4. Commit and push this change to your GitHub repository:
   ```bash
   git add .
   git commit -m "config: update api endpoint for production"
   git push origin master
   ```

### Step 2: Hosting on Vercel (Free Tier)
1. **Sign up:** Sign in to [Vercel.com](https://vercel.com) using your GitHub account.
2. **Import Project:** Click **Add New** -> **Project** and import your `Contextive.AI` repository.
3. **Configure Framework Settings:**
   * **Framework Preset:** Select **Angular**.
   * **Root Directory:** Set this to **`Contextive.ai UI`** (click Edit, select the directory, and confirm).
   * **Build Command:** Vercel automatically detects Angular and sets it to `ng build`.
   * **Output Directory:** Vercel automatically configures the output path (standard `dist/` compilation).
4. **Deploy:** Click **Deploy**. Vercel will compile the Angular typescript and serve the static pages globally. You will get a custom URL like `https://contextive-ui.vercel.app`.

---

## Part 3: Configuration & Security Checklists

- [ ] **CORS Enabled:** The backend project is already configured with `AllowAnyOrigin()` in `Program.cs`, meaning your Vercel frontend can talk to your Render backend without cross-origin blocks.
- [ ] **API Key Protected:** Ensure your API key is configured as an environment variable in your backend hosting service. Do not commit your API key to public source code files.
