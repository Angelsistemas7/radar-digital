#!/usr/bin/env bash
# ============================================================
# Radar Digital — Configuración inicial del VPS
# Ubuntu 22.04 / 24.04  ·  Corre UNA sola vez como root
#
# Uso:  bash scripts/setup-vps.sh
# ============================================================
set -euo pipefail

DOMAIN="semaforodigital.com"
APP_DIR="/opt/radar-digital"
CERTBOT_EMAIL="estebangood209@gmail.com"

echo "=== [1/5] Actualizando sistema ==="
apt-get update -y && apt-get upgrade -y

echo "=== [2/5] Instalando Docker ==="
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
fi
apt-get install -y docker-compose-plugin   # docker compose v2

echo "=== [3/5] Instalando Nginx ==="
apt-get install -y nginx
systemctl enable --now nginx

echo "=== [4/5] Instalando Certbot ==="
apt-get install -y certbot python3-certbot-nginx

echo "=== [5/5] Preparando directorio de la app ==="
mkdir -p "$APP_DIR"

echo ""
echo "✅  Dependencias instaladas. Continúa con estos pasos:"
echo ""
echo "──────────────────────────────────────────────────────"
echo " A. DNS — apunta $DOMAIN (y www.$DOMAIN) a la IP de este VPS"
echo "    (espera que propague antes de pedir el certificado)"
echo ""
echo " B. Desde tu máquina local sincroniza los archivos:"
echo "    bash scripts/deploy.sh"
echo ""
echo " C. En el VPS copia el config de Nginx:"
echo "    cp $APP_DIR/nginx/$DOMAIN.conf /etc/nginx/sites-available/"
echo "    ln -sf /etc/nginx/sites-available/$DOMAIN.conf /etc/nginx/sites-enabled/"
echo "    rm -f /etc/nginx/sites-enabled/default"
echo "    nginx -t && systemctl reload nginx"
echo ""
echo " D. Obtén el certificado SSL:"
echo "    certbot --nginx -d $DOMAIN -d www.$DOMAIN \\"
echo "            --email $CERTBOT_EMAIL --agree-tos --non-interactive"
echo ""
echo " E. Crea el archivo de entorno:"
echo "    cp $APP_DIR/.env.example $APP_DIR/.env.production"
echo "    nano $APP_DIR/.env.production   # rellena los valores reales"
echo ""
echo " F. Arranca la app:"
echo "    cd $APP_DIR && docker compose up -d --build"
echo ""
echo " G. Verifica:"
echo "    docker compose ps"
echo "    curl -s http://localhost:3000 | head -5"
echo "──────────────────────────────────────────────────────"
