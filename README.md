# K-Pop Studio Pro

A web app for tracking K-pop group releases, organizing groups into a drag-and-drop tier list, and analyzing songs with AI.

**Features:**
- **Tier Designer** — Drag-and-drop groups between tiers (PEAK, SSS, S, A, B, C). Changes persist to `tier_state.json`.
- **Discovery Hub** — Scan all groups for a given year, see verified tracks with real view counts, watch music videos inline, and get AI analysis per song.
- **Dual AI Backend** — Uses a local Ollama instance if available, otherwise falls back to Groq's free cloud API.

---

## Quick Start (Local)

### Prerequisites
- [Node.js](https://nodejs.org) (v18+)
- [Python](https://python.org) (3.10+)

### One-command setup

**Windows:**
```
setup.bat
```

**Mac / Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

Then open **http://localhost:8000** in your browser.

### Manual setup

```bash
# 1. Install and build frontend
cd frontend
npm install
npm run build
cd ..

# 2. Install backend dependencies
cd backend
pip install -r requirements.txt

# 3. Start server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Development mode (hot reload)

In two terminals:

```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend (proxies API to :8000)
cd frontend
npm run dev
```

Visit **http://localhost:5173** (Vite dev server).

---

## AI Analysis Setup

### Option A: Groq Cloud (Easiest — no install needed)

1. Create a free account at [console.groq.com](https://console.groq.com)
2. Generate an API key
3. Enter the key in the app sidebar under **Groq API Key**

Free tier: 30 requests/minute, 14,400 requests/day with Llama 3.1 8B.

### Option B: Ollama Local (For your own GPU)

Best if you have an NVIDIA GPU (e.g., RTX 4080). Runs entirely on your machine.

#### Step 1: Install Ollama
Download and install from [ollama.com](https://ollama.com).

#### Step 2: Pull the model
```
ollama pull llama3.1
```

#### Step 3: Enable CORS (required for browser access)

**Windows:**
1. Open **Settings** > **System** > **About** > **Advanced system settings**
2. Click **Environment Variables**
3. Under **User variables**, click **New**
4. Variable name: `OLLAMA_ORIGINS`
5. Variable value: `*`
6. Click OK, then **restart Ollama** (close from system tray and reopen)

**Mac:**
```bash
launchctl setenv OLLAMA_ORIGINS "*"
# Restart Ollama
```

**Linux:**
```bash
sudo systemctl edit ollama.service
# Add under [Service]:
# Environment="OLLAMA_ORIGINS=*"
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

#### Step 4: Verify
```
curl http://localhost:11434/api/tags
```
You should see a JSON response listing your models.

The app auto-detects Ollama when set to **Auto** mode in the sidebar.

---

## Deploy to Render (Free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com), connect your repo
3. Render will use `render.yaml` for configuration
4. Set `GROQ_API_KEY` in Environment Variables
5. Deploy — you'll get a public URL to share

Free tier: 750 hours/month, spins down after 15 min of inactivity.

---

## Project Structure

```
├── frontend/          React (Vite) + Tailwind + dnd-kit
│   └── src/
│       ├── components/
│       │   ├── TierBoard/     Drag-and-drop tier list
│       │   ├── DiscoveryHub/  Song list, video player, AI panel
│       │   └── Layout/        Sidebar and header
│       ├── hooks/             useTierState, useSongs, useLlm
│       └── lib/               API client, types
├── backend/           FastAPI
│   ├── api/
│   │   ├── ytmusic.py         YouTube Music scraping
│   │   └── llm.py             Groq proxy
│   └── state/
│       └── persistence.py     tier_state.json read/write
├── tier_state.json    Persisted tier assignments
├── render.yaml        Render deployment config
├── setup.bat          Windows one-click setup
└── setup.sh           Mac/Linux one-click setup
```
