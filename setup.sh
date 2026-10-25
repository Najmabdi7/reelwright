#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "🎬 Agent Video Studio - Environment Setup"
echo "=========================================================="

# 1. Setup Python Virtual Environment
echo "→ [1/3] Setting up Python virtual environment (.venv)..."
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 2. Install Playwright browser
echo "→ [2/3] Installing Playwright Chromium browser..."
playwright install chromium

# 3. Setup Remotion Node Studio
echo "→ [3/3] Installing Node.js dependencies for Remotion studio..."
cd agent-video-studio
npm install
cd ..

echo "=========================================================="
echo "✓ Installation complete!"
echo "To generate a video, run:"
echo "  source .venv/bin/activate"
echo "  python3 generate_video_agent.py --url <github_url>"
echo "=========================================================="
