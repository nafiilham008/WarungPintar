#!/bin/bash
set -e

# 1. Update & Install Security Tools
echo "[1/4] Installing Security Tools..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -y ufw fail2ban

# 2. Configure Firewall (UFW)
echo "[2/4] Configuring Firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

# 3. Harden SSH (Disable Password Login)
echo "[3/4] Hardening SSH Config..."
# Backup config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
# Disable Password Auth
sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config
# Ensure Pubkey is enabled
sed -i 's/^#\?PubkeyAuthentication .*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
# Disable Empty Passwords
sed -i 's/^#\?PermitEmptyPasswords .*/PermitEmptyPasswords no/' /etc/ssh/sshd_config

# Restart SSH to apply
systemctl restart ssh

# 4. Configure Fail2Ban
echo "[4/4] Activating Fail2Ban..."
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
systemctl enable fail2ban
systemctl restart fail2ban

echo "✅ Server Security Hardened Successfully!"
echo "----------------------------------------"
ufw status verbose
