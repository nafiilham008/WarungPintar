#!/bin/bash
set -e

echo "[1/5] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs
node -v
npm -v

echo "[2/5] Installing PM2 & Yarn..."
npm install -g pm2 yarn

echo "[3/5] Installing Nginx..."
apt-get install -y nginx

echo "[4/5] Installing PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

echo "[5/5] Configuring Database..."
# Check if user exists, if not create
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='warung'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE USER warung WITH PASSWORD 'warung123';"

# Check if db exists, if not create
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='warung_ibu_pintar'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE warung_ibu_pintar OWNER warung;"

echo "✅ Environment Setup Complete!"
echo "- Node: $(node -v)"
echo "- DB: warung_ibu_pintar created"
