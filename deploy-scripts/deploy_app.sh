#!/bin/bash
set -e

# Configuration
REPO_URL="https://github.com/nafiilham008/WarungPintar.git"
APP_DIR="/var/www/warung-ibu-pintar"
DOMAIN="warung-cahyo.online"

echo "[1/6] Cloning Repository..."
# Remove existing dir if exists
rm -rf $APP_DIR
git clone $REPO_URL $APP_DIR
cd $APP_DIR

echo "[2/6] Installing Dependencies..."
npm install

echo "[3/6] Setting up Environment..."
# Create production .env
cat <<EOF > .env
DATABASE_URL="postgresql://warung:warung123@localhost:5432/warung_ibu_pintar"
GEMINI_API_KEY="AIzaSyCS5TIwv6sMhjkIxcvnOxLopMDMslk30rs"
NEXT_PUBLIC_BASE_URL="https://${DOMAIN}"
EOF

echo "[4/6] Building Application..."
npm run build

echo "[5/6] Initializing Database..."
npx prisma generate
npx prisma db push

echo "[6/6] Starting with PM2..."
pm2 delete warung-ibu-pintar || true
pm2 start npm --name "warung-ibu-pintar" -- start

echo "[7/6] Saving PM2 List..."
pm2 save
pm2 startup | tail -n 1 | bash || true

echo "✅ Application Deployed Successfully!"
