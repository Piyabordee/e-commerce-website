# DOCKER.md — คู่มือการ Deploy ระบบด้วย Docker

## ⚠️ คำเตือนสำคัญ: Production System

เอกสารนี้ใช้สำหรับ **ระบบ Production จริง** ซึ่งมีข้อมูลลูกค้าและการสั่งซื้อจริง
- **ทุกคำสั่งต้องอ่านให้ละเอียดก่อนรัน**
- **ต้อง Backup ก่อนทำอะไรทุกครั้ง** (ดู Section 0.1)
- **ห้ามรันคำสั่งที่ไม่เข้าใจ**
- **ทดสอบใน staging ก่อน production เสมอ**

## ภาพรวม (Overview)

เอกสารนี้อธิบายวิธีการติดตั้งและ Deploy ระบบ E-Commerce ของร้านของปิยบดี ด้วย Docker และ Docker Compose สำหรับการใช้งานจริง (Production)

---

## โครงสร้างไฟล์ Docker (Docker Files Structure)

```
e-commerce-website-main/
├── Dockerfile              # Image build configuration
├── docker-compose.yml      # Service orchestration
├── .dockerignore           # Files to exclude from build
├── nginx.conf              # Nginx reverse proxy config
└── .env.production         # Production environment variables
```

---

## ⚠️ CRITICAL: Production Backup & Recovery Procedures

### สำคัญมาก: ระบบ Production ห้ามพัง - ต้อง Backup ก่อนทำอะไรทุกครั้ง

### 0.1 Pre-Deployment Backup (ทำก่อน Deploy ทุกครั้ง)

```bash
#!/bin/bash
# บันทึกเป็นไฟล์ backup.sh แล้วรันก่อน deploy ทุกครั้ง

BACKUP_DIR=~/backups/piyabordee-shop-$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "📦 Starting backup to $BACKUP_DIR"

# 1. Backup Database (สำคัญที่สุด)
docker exec piyabordee-postgres pg_dump -U piyabordee piyabordee_shop | gzip > $BACKUP_DIR/database.sql.gz

# 2. Backup Docker Volumes
docker run --rm -v piyabordee-shop_postgres_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/postgres_volume.tar.gz -C /data .
docker run --rm -v piyabordee-shop_app_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/app_volume.tar.gz -C /data .

# 3. Backup Environment Variables
cp .env.production $BACKUP_DIR/env.production.bak 2>/dev/null || true

# 4. Backup Configuration Files
cp docker-compose.yml $BACKUP_DIR/docker-compose.yml.bak
cp Dockerfile $BACKUP_DIR/Dockerfile.bak
cp prisma/schema.prisma $BACKUP_DIR/schema.prisma.bak

# 5. Backup Nginx Config (ถ้ามี)
docker exec nginx-proxy cat /etc/nginx/nginx.conf > $BACKUP_DIR/nginx.conf.bak 2>/dev/null || true
docker exec nginx-proxy cat /etc/nginx/conf.d/default.conf > $BACKUP_DIR/nginx-default.conf.bak 2>/dev/null || true

# 6. Backup SSL Certificates (ถ้ามี)
docker cp nginx-proxy:/etc/nginx/ssl $BACKUP_DIR/ssl.bak 2>/dev/null || true

# 7. บันทึก version ปัจจุบัน
git rev-parse HEAD > $BACKUP_DIR/git-commit.txt 2>/dev/null || echo "no-git" > $BACKUP_DIR/git-commit.txt

echo "✅ Backup completed: $BACKUP_DIR"
echo "💾 Database size: $(du -h $BACKUP_DIR/database.sql.gz | cut -f1)"
echo "📊 Total backup size: $(du -sh $BACKUP_DIR | cut -f1)"

# เก็บ backup ไว้ 30 วัน (ลบอัตโนมัติ)
find ~/backups -type d -mtime +30 -exec rm -rf {} + 2>/dev/null || true
```

### 0.2 Automated Daily Backup (ตั้ง cron job)

```bash
# สร้าง script สำหรับ daily backup
cat > ~/backup-daily.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups/daily-$(date +%Y%m%d)
mkdir -p $BACKUP_DIR

# Database backup (รอบ 1 ต่อวัน)
docker exec piyabordee-postgres pg_dump -U piyabordee piyabordee_shop | gzip > $BACKUP_DIR/database-$(date +%H%M).sql.gz

# ส่ง notification ถ้า backup ล้มเหลว (ถ้ามี Slack/Discord webhook)
# curl -X POST $WEBHOOK_URL -d '{"text":"Backup completed: '$BACKUP_DIR'"}'

# เก็บไว้ 7 วัน
find ~/backups/daily-* -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
EOF

chmod +x ~/backup-daily.sh

# ตั้ง cron ให้รันทุกวันเวลา 02:00 น.
crontab -e
# เพิ่มบรรทัดนี้:
# 0 2 * * * ~/backup-daily.sh >> ~/backup-daily.log 2>&1
```

### 0.3 Recovery Procedures (วิธีกู้คืนเมื่อระบบเสีย)

#### Recovery แบบ Database เท่านั้น

```bash
# 1. เลือก backup ที่จะใช้
BACKUP_DIR=~/backups/piyabordee-shop-YYYYMMDD_HHMMSS

# 2. Restore database
gunzip < $BACKUP_DIR/database.sql.gz | docker exec -i piyabordee-postgres psql -U piyabordee piyabordee_shop

# 3. ตรวจสอบ
docker exec -it piyabordee-postgres psql -U piyabordee piyabordee_shop -c "\dt"
```

#### Recovery แบบ Full System (ระบบพังใหญ่)

```bash
# 1. หยุดทุก service
docker-compose down

# 2. Restore volumes
docker run --rm -v piyabordee-shop_postgres_data:/data -v ~/backups/piyabordee-shop-YYYYMMDD_HHMMSS:/backup alpine sh -c "rm -rf /data/* && tar xzf /backup/postgres_volume.tar.gz -C /data"
docker run --rm -v piyabordee-shop_app_data:/data -v ~/backups/piyabordee-shop-YYYYMMDD_HHMMSS:/backup alpine sh -c "rm -rf /data/* && tar xzf /backup/app_volume.tar.gz -C /data"

# 3. Restore environment
cp ~/backups/piyabordee-shop-YYYYMMDD_HHMMSS/env.production.bak .env.production

# 4. Restore config files
cp ~/backups/piyabordee-shop-YYYYMMDD_HHMMSS/docker-compose.yml.bak docker-compose.yml

# 5. เริ่มระบบใหม่
docker-compose up -d

# 6. ตรวจสอบ status
docker-compose ps
docker-compose logs
```

### 0.4 Backup Testing (ทดสอบ backup ว่าใช้ได้จริง)

```bash
# ทดสอบ restore ไปยัง database ใหม่ (ไม่กระทบ production)
BACKUP_DIR=~/backups/piyabordee-shop-YYYYMMDD_HHMMSS

# สร้าง test database
docker exec -it piyabordee-postgres psql -U piyabordee -c "DROP DATABASE IF EXISTS piyabordee_shop_test;"
docker exec -it piyabordee-postgres psql -U piyabordee -c "CREATE DATABASE piyabordee_shop_test;"

# Restore เข้า test database
gunzip < $BACKUP_DIR/database.sql.gz | docker exec -i piyabordee-postgres psql -U piyabordee piyabordee_shop_test

# ตรวจสอบข้อมูล
docker exec -it piyabordee-postgres psql -U piyabordee piyabordee_shop_test -c "SELECT COUNT(*) FROM \"Product\";"

# ลบ test database เสร็จแล้ว
docker exec -it piyabordee-postgres psql -U piyabordee -c "DROP DATABASE piyabordee_shop_test;"
```

---

## 1. เตรียมไฟล์ Configuration (Prepare Configuration Files)

### 1.1 สร้างไฟล์ `.env.production`

สร้างไฟล์ `.env.production` ที่ root ของ project:

```bash
# .env.production

# Application
NODE_ENV=production
PORT=3000

# Database (PostgreSQL)
DATABASE_URL=postgresql://piyabordee:YOUR_SECURE_PASSWORD@postgres:5432/piyabordee_shop?schema=public
DB_PASSWORD=YOUR_SECURE_PASSWORD

# Admin Authentication
ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD
ADMIN_TOKEN_SECRET=YOUR_RANDOM_SECRET_KEY_MINIMUM_32_CHARS

# Nginx (Optional)
NGINX_PORT=80
NGINX_SSL_PORT=443
```

**คำเตือน**: อย่า commit `.env.production` เข้า Git ใช้ `.env.production.example` แทน

### 1.2 อัปเดต `next.config.js` สำหรับ Production

ตรวจสอบว่าไฟล์ `next.config.js` มี `output: 'standalone'`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // REQUIRED for Docker
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
```

### 1.3 อัปเดต Prisma Schema สำหรับ PostgreSQL

แก้ไข `prisma/schema.prisma` จาก SQLite เป็น PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"  // เปลี่ยนจาก "sqlite"
  url      = env("DATABASE_URL")
}
```

---

## 2.การ Deploy ด้วย Docker Compose (Deploy with Docker Compose)

### 2.1 Build และ Run ทั้งหมด (Build and Run All Services)

```bash
# Build images
docker-compose build

# Start services (background mode)
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 2.2 Run Database Migrations

```bash
# Generate Prisma client inside container
docker-compose exec app npx prisma generate

# Push schema to database
docker-compose exec app npx prisma db push

# Seed initial data (optional)
docker-compose exec app npm run seed
```

### 2.3 ตรวจสอบสถานะ (Health Check)

```bash
# Check app health
curl http://localhost:3000

# Check database connection
docker-compose exec postgres psql -U piyabordee -d piyabordee_shop -c "SELECT 1;"

# View logs for specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

---

## 3. การ Deploy ด้วย Nginx Reverse Proxy (Deploy with Nginx)

### 3.1 เปิดใช้งาน Nginx

```bash
# Start with Nginx profile
docker-compose --profile with-nginx up -d

# Application จะเข้าผ่าน port 80 แทน 3000
curl http://localhost
```

### 3.2 ติดตั้ง SSL Certificate (Let's Encrypt)

```bash
# ติดตั้ง certbot บน host machine
sudo apt-get install certbot

# สร้าง SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# คัดลอก certificates ไปยังโฟลเดอร์ ssl/
mkdir ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem

# Uncomment HTTPS block ใน nginx.conf
# และ restart services
docker-compose restart nginx
```

---

## 4. Docker CLI Commands ที่ใช้บ่อย (Common Docker Commands)

### 4.1 Container Management

```bash
# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove with volumes
docker-compose down -v

# Restart specific service
docker-compose restart app

# Execute command in container
docker-compose exec app sh
docker-compose exec postgres psql -U piyabordee -d piyabordee_shop
```

### 4.2 Logs & Monitoring

```bash
# Follow logs
docker-compose logs -f

# Logs for specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app

# Resource usage
docker stats
```

### 4.3 Database Backup & Restore

```bash
# ========== QUICK BACKUP ==========
# Backup ด่วน (ใช้ขณะที่ระบบรันอยู่ได้เลย)
docker exec piyabordee-postgres pg_dump -U piyabordee piyabordee_shop | gzip > backup-$(date +%Y%m%d_%H%M%S).sql.gz

# ========== FULL BACKUP (แนะนำสำหรับ Production) ==========
# Backup พร้อม compress และตรวจสอบความสมบูรณ์
docker exec piyabordee-postgres pg_dump -U piyabordee -F c piyabordee_shop | gzip > backup-full-$(date +%Y%m%d_%H%M%S).sql.gz

# ========== RESTORE DATABASE ==========
# วิธีที่ 1: จาก gzip backup
gunzip < backup-YYYYMMDD_HHMMSS.sql.gz | docker exec -i piyabordee-postgres psql -U piyabordee piyabordee_shop

# วิธีที่ 2: จาก custom format backup (recommended)
gunzip < backup-full-YYYYMMDD_HHMMSS.sql.gz | docker exec -i piyabordee-postgres pg_restore -U piyabordee -d piyabordee_shop --clean --if-exists

# ========== BACKUP SPECIFIC TABLES ==========
# Backup เฉพาะตารางที่ต้องการ
docker exec piyabordee-postgres pg_dump -U piyabordee -t "Product" -t "CartItem" piyabordee_shop > backup-tables-$(date +%Y%m%d_%H%M%S).sql
```

---

## 5. Production Deployment บน Cloud Server

### 5.1 DigitalOcean / Linode / AWS Lightsail

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Clone repository
git clone https://github.com/Piyabordee/e-commerce-website.git
cd e-commerce-website

# 4. Configure .env.production
cp .env.production.example .env.production
nano .env.production

# 5. Build and start
docker-compose build
docker-compose up -d

# 6. Run migrations
docker-compose exec app npx prisma db push
docker-compose exec app npm run seed
```

### 5.2 Firewall Configuration

```bash
# UFW setup
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# หรือใช้ firewall-cmd (RHEL/CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## 6. CI/CD Pipeline Example (GitHub Actions)

สร้างไฟล์ `.github/workflows/docker-deploy.yml`:

```yaml
name: Docker Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/app
            git pull
            docker-compose build
            docker-compose up -d
            docker-compose exec app npx prisma db push
```

---

## 7. Troubleshooting

### 7.1 Container ไม่สามารถเชื่อมต่อ Database

```bash
# ตรวจสอบ network
docker network ls
docker network inspect e-commerce-website-main_piyabordee-network

# ตรวจสอบ DATABASE_URL
echo $DATABASE_URL
```

### 7.2 Prisma Generate Error

```bash
# Re-generate Prisma client
docker-compose exec app npx prisma generate

# หรือ rebuild container
docker-compose build --no-cache app
docker-compose up -d app
```

### 7.3 Port ถูกใช้งานแล้ว

```bash
# ตรวจสอบ port ที่ใช้งาน
sudo lsof -i :3000
sudo lsof -i :80

# เปลี่ยน port ใน docker-compose.yml
ports:
  - "8080:3000"  # ใช้ port 8080 แทน
```

### 7.4 Permission Issues

```bash
# ตรวจสอบ permissions ของ volumes
docker-compose down
sudo rm -rf postgres_data app_data
docker-compose up -d
```

---

## 8. Security Best Practices

### 8.1 Environment Variables

- ใช้ `ADMIN_TOKEN_SECRET` ที่มีความยาวอย่างน้อย 32 ตัวอักษร
- ใช้ความยาวรหัสผ่านอย่างน้อย 16 ตัวอักษร
- ไม่เคย commit secrets เข้า Git
- ใช้ Docker Secrets หรือ environment file ที่ปลอดภัย

### 8.2 Database Security

- เปลี่ยนค่าเริ่มต้นของ database credentials
- ใช้ strong passwords
- จำกัดการเข้าถึง database เฉพาะจากภายใน network เท่านั้น
- Regular backups

### 8.3 Nginx Security

- Rate limiting ตามที่กำหนดใน `nginx.conf`
- Security headers
- SSL/TLS enabled
- Regular updates

---

## 9. Performance Optimization

### 9.1 Docker Image Size

- ใช้ `alpine` base images
- Multi-stage builds (ใช้แล้วใน Dockerfile)
- `.dockerignore` เพื่อลด context size

### 9.2 Application Performance

- Next.js standalone output
- Nginx caching สำหรับ static assets
- Database connection pooling
- Redis สำหรับ session storage (future enhancement)

---

## 10. Monitoring & Logging

### 10.1 Container Logs

```bash
# Real-time logs
docker-compose logs -f

# Save logs to file
docker-compose logs > logs_$(date +%Y%m%d).log
```

### 10.2 Health Checks

```bash
# Application health
curl http://localhost:3000/health

# Container health
docker inspect piyabordee-app | grep -A 10 Health
```

### 10.3 Metrics Collection (Optional)

พิจารณาใช้ tools เหล่านี้:
- Prometheus + Grafana
- Docker Stats
- Cloud provider monitoring tools

---

## Checklist ก่อน Deploy (Pre-Deploy Checklist)

### ⚠️ ส่วนที่เกี่ยวกับ Backup (จำเป็นมาก)

- [ ] **รัน full backup script** ก่อน deploy ทุกครั้ง (ดู section 0.1)
- [ ] **ตั้งค่า automated daily backup** (ดู section 0.2)
- [ ] **ทดสอบ backup ว่า restore ได้จริง** (ดู section 0.4)
- [ ] มี recovery plan พร้อม (รู้วิธี rollback ถ้าอะไรผิดพลาด)

### Configuration

- [ ] สร้าง `.env.production` พร้อมค่าที่ถูกต้อง
- [ ] อัปเดต `next.config.js` ให้มี `output: 'standalone'`
- [ ] อัปเดต Prisma schema เป็น PostgreSQL

### Security

- [ ] ตรวจสอบ security settings (passwords, secrets)
- [ ] เปลี่ยน password ทั้งหมดจากค่าเริ่มต้น
- [ ] ตั้งค่า firewall rules (ให้เฉพาะ port 22, 80, 443)

### Testing

- [ ] ทดสอบ build ใน local ก่อน
- [ ] ทดสอบ health check endpoints
- [ ] ทดสอบ restore จาก backup 1 ครั้ง

### Production Setup

- [ ] เตรียม SSL certificates (ถ้าใช้ HTTPS)
- [ ] ตั้งค่า monitoring & logging
- [ ] ตั้งค่า log rotation (พื้นที่เต็มไม่ได้)
- [ ] ตั้งค่า alert (ถ้ามี monitoring system)

---

## Appendix: Quick Reference

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start all services in background |
| `docker-compose down` | Stop and remove containers |
| `docker-compose logs -f` | Follow logs |
| `docker-compose exec app sh` | Open shell in app container |
| `docker-compose restart app` | Restart app service |
| `docker-compose build --no-cache` | Rebuild without cache |
| `docker-compose ps` | Show running containers |
| `docker stats` | Show resource usage |

---

**เอกสารประกอบ**: [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md)

**อัปเดตล่าสุด**: 2026-02-23
