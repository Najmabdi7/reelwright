#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================="
echo "🎬 Agent Video Studio — installation"
echo "=========================================================="

# 0. Dépendances système
for bin in ffmpeg ffprobe node npm python3; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "✗ '$bin' est requis et absent du PATH." >&2
    exit 1
  fi
done
echo "✓ ffmpeg, node, npm, python3 présents"

# 1. Environnement Python
echo "→ [1/4] environnement virtuel (.venv)"
[ -d ".venv" ] || python3 -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 2. Chromium pour les captures
echo "→ [2/4] Chromium Playwright"
playwright install chromium

# 3. Studio Remotion
echo "→ [3/4] dépendances npm du studio"
(cd agent-video-studio && npm install)

# 4. Dossiers de travail
echo "→ [4/4] dossiers"
mkdir -p output agent-video-studio/.work agent-video-studio/public/assets

echo "=========================================================="
echo "✓ Installation terminée"
echo
echo "Générer un short vertical :"
echo "  source .venv/bin/activate"
echo "  python3 generate_video_agent.py --content content/rea_short.json --format short"
echo
echo "Générer un format long   :"
echo "  python3 generate_video_agent.py --content <fichier>.json --format long"
echo
echo "Voix : ELEVENLABS_API_KEY dans l'environnement, .env, ou ~/.hermes/.env"
echo "Absente → repli automatique sur edge-tts (gratuit, timings réels aussi)."
echo "=========================================================="
