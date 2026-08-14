#!/bin/bash
set -euo pipefail

echo "========================================"
echo "GradHire AI — Oracle Cloud Deployment"
echo "========================================"

# Configuration
APP_DIR="${APP_DIR:-$HOME/gradhire-ai}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
DOMAIN="${DOMAIN:-gradture.ai}"

echo "App directory: $APP_DIR"
echo "Domain: $DOMAIN"

# Step 1: Update system
echo ""
echo "[1/8] Updating system..."
sudo apt update && sudo apt upgrade -y

# Step 2: Install dependencies
echo ""
echo "[2/8] Installing dependencies..."
sudo apt install -y curl git ufw

# Step 3: Install Docker
echo ""
echo "[3/8] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo systemctl enable --now docker
    sudo usermod -aG docker "$USER"
    echo "Docker installed. You may need to log out and back in."
else
    echo "Docker already installed."
fi

# Step 4: Configure firewall
echo ""
echo "[4/8] Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable || true
sudo ufw status

# Step 5: Clone repository
echo ""
echo "[5/8] Cloning repository..."
if [ ! -d "$APP_DIR" ]; then
    git clone https://github.com/your-username/gradhire-ai.git "$APP_DIR"
else
    echo "Repository already exists. Pulling latest..."
    cd "$APP_DIR"
    git pull
fi
cd "$APP_DIR"

# Step 6: Environment check
echo ""
echo "[6/8] Checking environment..."
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "Please edit .env with your real values:"
    echo "  nano $APP_DIR/.env"
    echo ""
    read -p "Press Enter after editing .env to continue..."
fi

# Step 7: Deploy with Docker Compose
echo ""
echo "[7/8] Deploying application..."
docker compose -f "$COMPOSE_FILE" up -d

# Step 8: Run migrations
echo ""
echo "[8/8] Running database migrations..."
docker compose -f "$COMPOSE_FILE" exec backend npx prisma migrate deploy || {
    echo "WARNING: Migrations failed. Check DATABASE_URL in .env"
}

echo ""
echo "========================================"
echo "Deployment complete!"
echo "========================================"
echo ""
echo "Services:"
echo "  Frontend:  https://$DOMAIN"
echo "  API:       https://api.$DOMAIN"
echo "  Admin:     https://admin.$DOMAIN"
echo "  AI:        http://<vm-ip>:8000"
echo ""
echo "Next steps:"
echo "  1. Point your domain A records to this VM's IP"
echo "  2. Install Caddy for HTTPS: sudo apt install -y caddy"
echo "  3. Configure Caddy with deploy/Caddyfile"
echo "  4. Verify: curl https://$DOMAIN"
echo ""
echo "Useful commands:"
echo "  docker compose -f $COMPOSE_FILE logs -f    # View logs"
echo "  docker compose -f $COMPOSE_FILE ps         # Check status"
echo "  docker compose -f $COMPOSE_FILE restart    # Restart services"
echo ""
