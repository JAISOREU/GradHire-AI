# Oracle Cloud Free Tier — GradTure Deployment Guide

## Prerequisites
- Oracle Cloud account with PayPal verification (or credit card)
- Domain name pointing to your VM's public IP
- Local SSH key pair

## Step 1: Create Free VM

1. Go to https://cloud.oracle.com
2. Sign up / log in
3. Navigate to **Compute > Instances**
4. Click **Create Instance**
5. Configure:
   - **Name:** `gradhire-vm`
   - **Compartment:** Your compartment
   - **Availability Domain:** Any
   - **Image:** Canonical Ubuntu 22.04
   - **Shape:** `VM.Standard.A1.Flex` (Always Free)
     - OCPU: 4
     - Memory: 24 GB
   - **SSH Keys:** Add your public key (`~/.ssh/id_rsa.pub`)
   - **Boot Volume:** 50 GB (maximum free)
6. Click **Create**

## Step 2: Initial VM Setup

SSH into the VM:
```powershell
ssh ubuntu@<your-vm-ip>
```

Update and install dependencies:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw
```

## Step 3: Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu
newgrp docker
```

## Step 4: Configure Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

## Step 5: Clone Repository

```bash
cd ~
git clone https://github.com/your-username/gradhire-ai.git
cd gradhire-ai
```

## Step 6: Environment Configuration

Copy and edit `.env`:
```bash
cp .env.example .env
nano .env
```

Required changes:
```env
# Database - use external free PostgreSQL (Neon.tech or Supabase)
DATABASE_URL=postgresql://user:pass@host:5432/gradhire
POSTGRES_USER=gradhire
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=gradhire

# JWT - generate with: openssl rand -hex 32
JWT_SECRET=<64-char-random-hex>
JWT_EXPIRES_IN=7d

# URLs - replace with your real domain
CORS_ORIGIN=https://gradture.ai,https://www.gradture.ai,https://admin.gradture.ai
FRONTEND_URL=https://gradture.ai

# Email - Resend
RESEND_API_KEY=re_...
SMTP_FROM=GradTure <noreply@gradture.ai>

# Redis - use external free Redis (Upstash or Redis Cloud)
REDIS_URL=redis://<host>:6379

# Recommendation Service
SERVICE_URL=http://ai-service:8000

# Storage - Cloudflare R2
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=<your-account-id>
R2_BUCKET=gradhire-uploads
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY=<access-key>
R2_SECRET_KEY=<secret-key>

# Sentry
SENTRY_DSN=https://...
VITE_SENTRY_DSN=https://...
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=gradhire@1.0.0
VITE_APP_VERSION=1.0.0

# Admin
ADMIN_SETUP_SECRET=<64-char-random-hex>
```

## Step 7: Install Caddy (Reverse Proxy + HTTPS)

```bash
sudo apt install -y caddy
```

Configure Caddy:
```bash
sudo nano /etc/caddy/Caddyfile
```

Paste:
```
gradture.ai {
  reverse_proxy localhost:80
}

www.gradture.ai {
  reverse_proxy localhost:80
}

api.gradture.ai {
  reverse_proxy localhost:3000
}

admin.gradture.ai {
  reverse_proxy localhost:3000
}
```

Enable and start:
```bash
sudo systemctl enable --now caddy
```

## Step 8: Deploy Application

```bash
cd ~/gradhire-ai
docker compose -f docker-compose.prod.yml up -d
```

## Step 9: Run Migrations

```bash
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

## Step 10: Verify Deployment

```bash
# Check all services are running
docker compose -f docker-compose.prod.yml ps

# Check backend health
curl https://api.gradture.ai/api/v1/health

# Check frontend
curl https://gradture.ai

# Check logs for errors
docker compose -f docker-compose.prod.yml logs --tail 50
```

## Step 11: Configure DNS

In your domain registrar, set:
- `A` record: `gradture.ai` → `<your-vm-ip>`
- `A` record: `www.gradture.ai` → `<your-vm-ip>`
- `A` record: `api.gradture.ai` → `<your-vm-ip>`
- `A` record: `admin.gradture.ai` → `<your-vm-ip>`

Wait for DNS propagation (5-30 minutes), then verify:
```bash
curl https://gradture.ai
curl https://api.gradture.ai/api/v1/health
```

## Useful Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop services
docker compose -f docker-compose.prod.yml down

# Update code
cd ~/gradhire-ai && git pull && docker compose -f docker-compose.prod.yml up -d --build

# Check disk usage
df -h

# Check Docker disk usage
docker system df
```

## Troubleshooting

**Port 80/443 already in use:**
```bash
sudo systemctl stop nginx apache2
sudo systemctl disable nginx apache2
```

**Out of memory:**
```bash
# Check memory usage
free -h
# Restart services
docker compose -f docker-compose.prod.yml restart
```

**Database connection issues:**
- Verify `DATABASE_URL` is correct
- Check PostgreSQL allows connections from your VM IP
- Test connection: `docker compose -f docker-compose.prod.yml exec backend node -e "require('pg').Client"`

## Security Hardening

```bash
# Disable password authentication
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd

# Enable automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Set up fail2ban
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
```

## Monitoring

```bash
# Real-time container stats
docker stats

# Follow logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
```
