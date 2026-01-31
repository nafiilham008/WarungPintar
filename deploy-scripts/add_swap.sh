#!/bin/bash
set -e

# Size of swap (2GB)
SWAP_SIZE="2G"
SWAP_FILE="/swapfile"

echo "[1/4] Checking Swap..."
if swapon --show | grep -q "$SWAP_FILE"; then
    echo "Swap already exists."
else
    echo "Creating $SWAP_SIZE Swap File..."
    fallocate -l $SWAP_SIZE $SWAP_FILE
    chmod 600 $SWAP_FILE
    mkswap $SWAP_FILE
    swapon $SWAP_FILE
    
    # Persistent
    echo "$SWAP_FILE none swap sw 0 0" | tee -a /etc/fstab
    
    # Tuning
    sysctl vm.swappiness=10
    echo "vm.swappiness=10" | tee -a /etc/sysctl.conf
    
    echo "✅ Swap Created Successfully!"
fi

echo "--------------------------------"
free -h
