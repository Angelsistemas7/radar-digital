#!/usr/bin/env bash
# ============================================================
# Radar Digital — Deploy al VPS (corre desde tu máquina local)
#
# Uso:
#   bash scripts/deploy.sh           # actualizar app
#   bash scripts/deploy.sh --first   # primer deploy (solo sincroniza)
# ============================================================
set -euo pipefail

VPS_IP="158.101.105.13"
VPS_USER="root"
APP_DIR="/opt/radar-digital"
FIRST="${1:-}"

echo "=== Sincronizando archivos → $VPS_USER@$VPS_IP:$APP_DIR ==="
rsync -az --delete \
    --exclude='.env*' \
    --exclude='node_modules/' \
    --exclude='.next/' \
    --exclude='.git/' \
    --exclude='*.log' \
    . "$VPS_USER@$VPS_IP:$APP_DIR/"

echo "✅  Archivos sincronizados."

if [[ "$FIRST" == "--first" ]]; then
    echo ""
    echo "Primera vez: corre ahora en el VPS:"
    echo "  ssh $VPS_USER@$VPS_IP"
    echo "  bash $APP_DIR/scripts/setup-vps.sh"
    exit 0
fi

echo "=== Construyendo imagen y reiniciando contenedor ==="
ssh "$VPS_USER@$VPS_IP" "
    set -euo pipefail
    cd $APP_DIR
    docker compose down
    docker compose up -d --build
    docker compose ps
"

echo "=== Deploy completo 🚀 → https://semaforodigital.com ==="
