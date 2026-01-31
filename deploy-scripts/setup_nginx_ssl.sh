#!/bin/bash
set -e

DOMAIN="warung-cahyo.online"

echo "[1/4] Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx

echo "[2/4] Configuring Nginx..."
cat <<EOF > /etc/nginx/sites-available/warung
server {
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/warung /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t
systemctl reload nginx

echo "[3/4] Obtaining SSL Certificate..."
# Non-interactive certbot
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN --redirect

echo "[4/4] Final Check..."
systemctl status nginx --no-pager

echo "✅ Nginx & SSL Configured Successfully!"
echo "Visit: https://$DOMAIN"
