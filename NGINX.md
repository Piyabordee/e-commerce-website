# NGINX.md — คำสั่งตรวจสอบและตั้งค่า Nginx

## ⚠️ คำเตือนสำคัญ: Production System

เอกสารนี้ใช้สำหรับจัดการ **Nginx บนระบบ Production จริง**
- **Nginx เป็นจุดเดียวที่ traffic ทุกคนเข้า** - พังทีนี้ระบบหมดเลย
- **ต้อง Backup config ก่อนแก้ไขทุกครั้ง** (ดูด้านล่าง)
- **ทดสอบ config ก่อน reload** (ใช้ `nginx -t`)
- **มี rollback plan พร้อมเสมอ**

---

## ตรวจสอบ Nginx Config จาก e-learning-web

รันคำสั่งเหล่านี้บน server **america** เพื่อดูว่า e-learning-web ตั้งค่า nginx อย่างไร:

### 1. ตรวจสอบ Container และ Image

```bash
# ดู containers ทั้งหมด
docker ps -a

# ดูรายละเอียด e-learning-web container
docker inspect e-learning-web

# ดู images
docker images | grep e-learning
```

### 2. ดึง Nginx Config จาก Container/Image

```bash
# ถ้า container กำลังรันอยู่
docker exec e-learning-web cat /etc/nginx/nginx.conf > e-learning-nginx.conf

# ถ้า container ไม่ได้รัน แต่มีอยู่
docker cp e-learning-web:/etc/nginx/nginx.conf e-learning-nginx.conf

# ถ้าต้องการดูจาก image โดยตรง
docker run --rm e-learning-web:latest cat /etc/nginx/nginx.conf > e-learning-nginx.conf

# ดู config ทั้งหมดในโฟลเดอร์ nginx
docker run --rm e-learning-web:latest sh -c "cat /etc/nginx/conf.d/*.conf" > e-learning-nginx-sites.conf

# ดูโครงสร้างไฟล์ nginx ใน image
docker run --rm e-learning-web:latest find /etc/nginx -type f -name "*.conf"
```

### 3. ตรวจสอบว่าใช้ Port อะไร

```bash
# ดู port mappings
docker port e-learning-web

# ดู EXPOSE จาก image
docker inspect e-learning-web:latest --format='{{range $key, $value := .Config.ExposedPorts}}{{$key}}{{end}}'
```

### 4. ตรวจสอบว่า Nginx อยู่ใน Image หรือไม่

```bash
# ดู base image และ layers
docker history e-learning-web:latest

# ตรวจสอบว่ามี nginx ใน image หรือไม่
docker run --rm e-learning-web:latest which nginx

# ตรวจสอบ version
docker run --rm e-learning-web:latest nginx -v
```

### 5. ดู Environment Variables และ Commands

```bash
# ดู env vars
docker inspect e-learning-web:latest --format='{{range .Config.Env}}{{.}} {{end}}'

# ดู startup command
docker inspect e-learning-web:latest --format='{{.Config.Cmd}}'
docker inspect e-learning-web:latest --format='{{.Config.Entrypoint}}'
```

### 6. ตรวจสอบ SSL Certificates (ถ้ามี)

```bash
# ดูว่ามี ssl folder ไหม
docker run --rm e-learning-web:latest ls -la /etc/nginx/ssl 2>/dev/null || echo "No SSL folder"

# ดูว่ามี certificate ไหม
docker run --rm e-learning-web:latest find / -name "*.pem" -o -name "*.crt" -o -name "*.key" 2>/dev/null
```

---

## ⚠️ CRITICAL: Backup ก่อนแก้ไขอะไรทุกครั้ง

### สำคัญมาก: เป็นระบบ Production ห้ามพัง

ก่อนทำอะไรกับ Nginx ต้อง backup ทุกครั้ง:

```bash
# 1. Backup ทั้งหมดก่อนเริ่มทำอะไร (รันทุกครั้ง)
mkdir -p ~/backups/nginx-$(date +%Y%m%d_%H%M%S)

# Backup nginx config
docker exec nginx-proxy cat /etc/nginx/nginx.conf > ~/backups/nginx-$(date +%Y%m%d_%H%M%S)/nginx.conf.bak
docker exec nginx-proxy cat /etc/nginx/conf.d/default.conf > ~/backups/nginx-$(date +%Y%m%d_%H%M%S)/default.conf.bak 2>/dev/null || true

# Backup SSL certificates (ถ้ามี)
docker cp nginx-proxy:/etc/nginx/ssl ~/backups/nginx-$(date +%Y%m%d_%H%M%S)/ssl.bak 2>/dev/null || true

# Backup docker-compose config
cp docker-compose.yml ~/backups/nginx-$(date +%Y%m%d_%H%M%S)/docker-compose.yml.bak 2>/dev/null || true

echo "✅ Backup completed at ~/backups/nginx-$(date +%Y%m%d_%H%M%S)/"
```

### Rollback Procedure (ถ้าพัง)

```bash
# 1. หยุด nginx container
docker stop nginx-proxy

# 2. Restore config จาก backup (แก้เลขที่ backup)
LATEST_BACKUP=$(ls -td ~/backups/nginx-* | head -1)
docker cp $LATEST_BACKUP/nginx.conf.bak nginx-proxy:/etc/nginx/nginx.conf

# 3. Restart container
docker start nginx-proxy

# 4. ตรวจสอบ status
docker ps | grep nginx-proxy
docker logs nginx-proxy --tail=50
```

---

## หลังจากได้ Config แล้ว

นำไฟล์ที่ได้ (`e-learning-nginx.conf`) มาให้ Claude ปรับปรุงเพื่อ:
1. รองรับทั้ง e-learning และ piyabordee shop
2. แยก nginx เป็น standalone container

---

## Safe Deployment Procedure (วิธี Deploy อย่างปลอดภัย)

### 1. Test Config ก่อน Apply

```bash
# แก้ไข config แล้วรันคำสั่งนี้เพื่อตรวจสอบ syntax
docker exec nginx-proxy nginx -t

# ถ้าได้ output แบบนี้คือ OK:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# ถ้ามี error จะบอกบรรทัดที่ผิด ต้องแก้ก่อน reload
```

### 2. Reload อย่างปลอดภัย (ไม่ทำให้ service หยุด)

```bash
# วิธีที่ 1: Reload (แนะนำ) - ไม่ตัด connection เดิม
docker exec nginx-proxy nginx -s reload

# วิธีที่ 2: Restart container (กรณีเปลี่ยน config ใหญ่ๆ)
docker restart nginx-proxy

# วิธีที่ 3: Re-create container (กรณีเปลี่ยน port/volume)
docker-compose up -d --force-recreate nginx
```

### 3. ตรวจสอบหลัง Reload

```bash
# ตรวจสอบว่า nginx ยังรันอยู่
docker ps | grep nginx-proxy

# ตรวจสอบ logs ไม่มี error
docker logs nginx-proxy --tail=50

# Test access จริง
curl -I http://localhost
curl -I https://your-domain.com

# Test domain ทั้งหมด
curl -I http://shop.piyabordee.com
curl -I http://learning.piyabordee.com
```

---

## Zero-Downtime Deployment (Deploy โดยไม่ให้ระบบหยุด)

### วิธีทำแบบ Blue-Green Deployment

```bash
# 1. สร้าง nginx container ใหม่ (nginx-new)
docker run -d --name nginx-proxy-new \
  -p 8080:80 \
  -v ~/new-nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:alpine

# 2. Test nginx container ใหม่
curl http://localhost:8080
docker logs nginx-proxy-new

# 3. ถ้า OK ให้สลับ port
docker stop nginx-proxy
docker rm nginx-proxy
docker rename nginx-proxy-new nginx-proxy

# 4. เปลี่ยน port กลับ
docker stop nginx-proxy
docker run -d --name nginx-proxy-temp \
  -p 80:80 \
  -v ~/new-nginx.conf:/etc/nginx/nginx.conf:ro \
  --network nginx-network \
  nginx:alpine
docker rm nginx-proxy
docker rename nginx-proxy-temp nginx-proxy
```

---

## Monitoring Nginx Health

```bash
# ตรวจสอบสถานะ container
docker ps | grep nginx

# ดู resource usage
docker stats nginx-proxy --no-stream

# ตรวจสอบ connections
docker exec nginx-proxy netstat -an | grep :80 | wc -l

# ตรวจสอบ error rate ใน logs
docker logs nginx-proxy --since=1h | grep -i error | wc -l

# ดู live logs
docker logs nginx-proxy -f --tail=100
```

---

## Troubleshooting Nginx Issues

### Case 1: 502 Bad Gateway

```bash
# ตรวจสอบว่า backend container รันอยู่ไหม
docker ps | grep piyabordee-app

# Test connect จาก nginx ไป backend
docker exec nginx-proxy wget -O- http://piyabordee-app:3000/health

# ตรวจสอบ upstream config
docker exec nginx-proxy cat /etc/nginx/nginx.conf | grep -A 5 upstream
```

### Case 2: SSL Certificate หมดอายุ

```bash
# ตรวจสอบ expiration
docker exec nginx-proxy ls -la /etc/nginx/ssl/

# ต่ออายุ Let's Encrypt
sudo certbot renew --standalone
docker cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx-proxy:/etc/nginx/ssl/cert.pem
docker cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx-proxy:/etc/nginx/ssl/key.pem
docker restart nginx-proxy
```

### Case 3: Nginx ไม่ยอม start

```bash
# ดู error logs
docker logs nginx-proxy

# Test config
docker exec nginx-proxy nginx -t

# Rollback ใช้ config เก่า
LATEST_BACKUP=$(ls -td ~/backups/nginx-* | head -1)
docker cp $LATEST_BACKUP/nginx.conf.bak nginx-proxy:/etc/nginx/nginx.conf
docker restart nginx-proxy
```

---

## หลังจากได้ Config แล้ว (Original)

นำไฟล์ที่ได้ (`e-learning-nginx.conf`) มาให้ Claude ปรับปรุงเพื่อ:
1. รองรับทั้ง e-learning และ piyabordee shop
2. แยก nginx เป็น standalone container
