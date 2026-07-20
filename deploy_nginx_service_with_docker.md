# Runbook triển khai GATS Academy với Nginx Docker

Tài liệu này ghi lại cấu hình hiện tại và quy trình cần thực hiện mỗi khi cập nhật code, build lại container hoặc recreate Docker Compose của **GATS Academy** và **nginx-service**.

---

## 1. Kiến trúc hiện tại

### Docker Compose


| Thành phần    | Thư mục                                         | Compose project |
| ------------- | ----------------------------------------------- | --------------- |
| GATS Academy  | `/home/sdt-webserver/GATS-ACADEMY`              | `gats-academy`  |
| Nginx Service | `/home/sdt-webserver/core/xtools/nginx-service` | `nginx-service` |




### Container và cổng nội bộ

Service chính của GATS Academy có tên Docker Compose là:

```text
app
```

Container hiện tại:

```text
gats-academy
```

Các domain được Nginx chuyển tiếp như sau:


| Domain          | Upstream trong Docker |
| --------------- | --------------------- |
| `api.gats.vn`   | `http://app:3000`     |
| `gats.vn`       | `http://app:3005`     |
|                 |                       |
| `admin.gats.vn` | `http://app:9000`     |


> Luôn dùng cổng **nội bộ container** trong `proxy_pass`.
>
> Không dùng `9100` cho admin vì `9100` chỉ là cổng publish trên máy chủ:
>
> ```text
> VPS:9100 -> container:9000
> ```



### Docker network

Nginx phải cùng tham gia network:

```text
gats-academy_default
```

Hiện tại `nginx-service` cần có cả hai network:

```text
sdt-tools
gats-academy_default
```

Kiểm tra:

```bash
sudo docker inspect nginx-service \
  --format '{{range $name, $config := .NetworkSettings.Networks}}{{$name}}{{"\n"}}{{end}}'
```

---



## 2. Cấu hình Nginx hiện tại

File cấu hình được lưu trên host tại:

```text
/home/sdt-webserver/core/xtools/nginx-service/nginx/sites-enabled/Ggats.vn.conf
```

File này được mount vào container:

```text
/etc/nginx/sites-enabled/Ggats.vn.conf
```

Nội dung chuẩn:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name api.gats.vn;

    client_max_body_size 500M;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_connect_timeout 60s;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}

server {
    listen 80;
    listen [::]:80;

    server_name gats.vn www.gats.vn;

    client_max_body_size 500M;

    location / {
        proxy_pass http://app:3005;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_connect_timeout 60s;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}

server {
    listen 80;
    listen [::]:80;

    server_name admin.gats.vn;

    client_max_body_size 500M;

    location / {
        proxy_pass http://app:9000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_connect_timeout 60s;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

Sau khi sửa file, luôn chạy:

```bash
sudo docker exec nginx-service nginx -t
sudo docker exec nginx-service nginx -s reload
```

Chỉ reload khi `nginx -t` báo:

```text
syntax is ok
test is successful
```

---



## 3. Việc bắt buộc để network không bị mất

Lệnh sau chỉ kết nối network tạm thời:

```bash
sudo docker network connect gats-academy_default nginx-service
```

Nếu `nginx-service` bị recreate, kết nối thủ công có thể bị mất. Vì vậy cần khai báo network trong Docker Compose của Nginx.

Mở file:

```bash
cd /home/sdt-webserver/core/xtools/nginx-service
sudo docker compose config --services
sudo nano docker-compose.yaml
```

Trong đúng service tạo ra container `nginx-service`, thêm network GATS. Ví dụ:

```yaml
services:
  nginx:
    networks:
      - sdt-tools
      - gats-academy

networks:
  sdt-tools:
    external: true
    name: sdt-tools

  gats-academy:
    external: true
    name: gats-academy_default
```

> Tên service có thể không phải `nginx`. Dùng kết quả của:
>
> ```bash
> sudo docker compose config --services
> ```
>
> rồi thêm `networks` vào đúng service.

Kiểm tra Compose:

```bash
sudo docker compose config
```

Áp dụng:

```bash
sudo docker compose up -d
```

Kiểm tra lại:

```bash
sudo docker inspect nginx-service \
  --format '{{range $name, $config := .NetworkSettings.Networks}}{{$name}}{{"\n"}}{{end}}'
```

Kết quả phải có:

```text
gats-academy_default
sdt-tools
```

---



## 4. Ngăn file Nginx cũ xuất hiện lại

Trước đây trong container có file:

```text
/etc/nginx/conf.d/gats.vn.conf
```

File này trùng `server_name gats.vn` với:

```text
/etc/nginx/sites-enabled/Ggats.vn.conf
```

Nếu chỉ dùng lệnh sau:

```bash
sudo docker exec nginx-service rm -f /etc/nginx/conf.d/gats.vn.conf
```

thì file có thể xuất hiện lại khi container Nginx được recreate.

### Cách xử lý cố định bằng bind mount

Tạo file rỗng trên host:

```bash
cd /home/sdt-webserver/core/xtools/nginx-service
sudo touch nginx/empty-gats.conf
```

Trong phần `volumes` của service Nginx, thêm:

```yaml
- ./nginx/empty-gats.conf:/etc/nginx/conf.d/gats.vn.conf:ro
```

Ví dụ:

```yaml
services:
  nginx:
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/sites-enabled:/etc/nginx/sites-enabled:ro
      - ./nginx/empty-gats.conf:/etc/nginx/conf.d/gats.vn.conf:ro
```

Sau đó áp dụng:

```bash
sudo docker compose config
sudo docker compose up -d
sudo docker exec nginx-service nginx -t
```

Kiểm tra không còn cấu hình trùng:

```bash
sudo docker exec nginx-service sh -c \
  "grep -R 'server_name.*gats.vn' -n /etc/nginx 2>/dev/null || true"
```

Kết quả chỉ nên nằm trong:

```text
/etc/nginx/sites-enabled/Ggats.vn.conf
```

---



## 5. Quy trình thông thường khi cập nhật code GATS



### Trường hợp chỉ cập nhật code của service `app`

```bash
cd /home/sdt-webserver/GATS-ACADEMY

git pull

sudo docker compose build app
sudo docker compose up -d app
```

Hoặc gộp thành:

```bash
sudo docker compose up -d --build app
```

Kiểm tra trạng thái:

```bash
sudo docker compose ps
```

Xem log:

```bash
sudo docker compose logs --tail=200 app
```

Theo dõi log trực tiếp:

```bash
sudo docker compose logs -f app
```

Thoát chế độ theo dõi bằng:

```text
Ctrl + C
```



### Sau khi container `app` bị recreate

Nginx có thể đang giữ IP cũ của container `app`. Vì vậy nên reload Nginx:

```bash
sudo docker exec nginx-service nginx -t
sudo docker exec nginx-service nginx -s reload
```

Sau đó test lại 3 domain.

---



## 6. Khi thay đổi biến môi trường

Nếu sửa `.env`, `environment` hoặc `env_file`, nên recreate service:

```bash
cd /home/sdt-webserver/GATS-ACADEMY

sudo docker compose up -d --build --force-recreate app
```

Sau đó:

```bash
sudo docker exec nginx-service nginx -t
sudo docker exec nginx-service nginx -s reload
```

Kiểm tra log:

```bash
sudo docker compose logs --tail=200 app
```

---



## 7. Khi thay đổi Dockerfile hoặc package dependency

Build lại không dùng cache khi nghi ngờ cache cũ:

```bash
cd /home/sdt-webserver/GATS-ACADEMY

sudo docker compose build --no-cache app
sudo docker compose up -d app
```

Sau đó reload Nginx:

```bash
sudo docker exec nginx-service nginx -t
sudo docker exec nginx-service nginx -s reload
```

> Không cần dùng `--no-cache` cho mọi lần deploy vì sẽ build lâu hơn. Chỉ dùng khi dependency hoặc image bị cache sai.

---



## 8. Khi cần deploy lại toàn bộ GATS Academy

Dùng khi thay đổi nhiều service hoặc thay đổi `docker-compose.yml`:

```bash
cd /home/sdt-webserver/GATS-ACADEMY

git pull

sudo docker compose config
sudo docker compose up -d --build
sudo docker compose ps
```

Kiểm tra các service:

```bash
sudo docker compose logs --tail=100 app
sudo docker compose logs --tail=100 db
sudo docker compose logs --tail=100 redis
sudo docker compose logs --tail=100 minio
```

Reload Nginx sau khi toàn bộ stack đã lên:

```bash
sudo docker exec nginx-service nginx -t
sudo docker exec nginx-service nginx -s reload
```

---



## 9. Không nên chạy `docker compose down` tùy tiện

Lệnh này sẽ dừng và xóa container/network do Compose tạo:

```bash
sudo docker compose down
```

Nếu chỉ cập nhật code, ưu tiên:

```bash
sudo docker compose up -d --build app
```

Nếu bắt buộc phải chạy `down`, không dùng `-v` trừ khi thật sự muốn xóa dữ liệu:

```bash
sudo docker compose down
sudo docker compose up -d --build
```

Tuyệt đối cẩn thận với:

```bash
sudo docker compose down -v
```

`-v` có thể xóa volume database, Redis hoặc dữ liệu liên quan.

Sau khi chạy `down` và `up`, kiểm tra network GATS:

```bash
sudo docker network ls | grep gats-academy
```

Kiểm tra Nginx còn trong network:

```bash
sudo docker inspect nginx-service \
  --format '{{range $name, $config := .NetworkSettings.Networks}}{{$name}}{{"\n"}}{{end}}'
```

Nếu chưa cấu hình network cố định trong Compose của Nginx, kết nối lại tạm thời:

```bash
sudo docker network connect gats-academy_default nginx-service
```

---



## 10. Kiểm tra kết nối nội bộ Docker

Kiểm tra Docker DNS từ Nginx:

```bash
sudo docker exec nginx-service getent hosts app
```

Kết quả đúng có dạng:

```text
172.x.x.x app
```

Kiểm tra trực tiếp từng cổng bằng container curl tạm:

```bash
sudo docker run --rm \
  --network gats-academy_default \
  curlimages/curl:latest \
  -I http://app:3000
```

```bash
sudo docker run --rm \
  --network gats-academy_default \
  curlimages/curl:latest \
  -I http://app:3005
```

```bash
sudo docker run --rm \
  --network gats-academy_default \
  curlimages/curl:latest \
  -I http://app:9000
```

Kết quả hiện tại đã xác nhận:

```text
app:3000 -> HTTP 302, Location: /users
app:3005 -> HTTP 200, Next.js
app:9000 -> HTTP 200, Next.js
```

Các mã `200`, `301`, `302`, `401`, `403` hoặc `404` đều chứng minh service đã phản hồi.

Các lỗi cần xử lý:

```text
Could not resolve host
Connection refused
Connection timed out
```

---



## 11. Kiểm tra qua Nginx trên [localhost](http://localhost)

Sau mỗi lần deploy, chạy:

```bash
curl -I -H "Host: api.gats.vn" http://127.0.0.1
curl -I -H "Host: gats.vn" http://127.0.0.1
curl -I -H "Host: admin.gats.vn" http://127.0.0.1
```

Kết quả mong đợi:

```text
api.gats.vn   -> HTTP 302 hoặc phản hồi API
gats.vn       -> HTTP 200
admin.gats.vn -> HTTP 200
```

Kiểm tra cấu hình domain không bị trùng:

```bash
sudo docker exec nginx-service sh -c \
  "grep -R 'server_name.*gats.vn' -n /etc/nginx 2>/dev/null || true"
```

Kiểm tra toàn bộ cấu hình Nginx:

```bash
sudo docker exec nginx-service nginx -T
```

---



## 12. Kiểm tra từ Internet

DNS cần trỏ về public IP của VPS:

```text
A  gats.vn        -> PUBLIC_IP_VPS
A  api.gats.vn    -> PUBLIC_IP_VPS
A  admin.gats.vn  -> PUBLIC_IP_VPS
```

Kiểm tra:

```bash
curl -I http://gats.vn
curl -I http://api.gats.vn
curl -I http://admin.gats.vn
```

Nếu localhost chạy nhưng domain bên ngoài không chạy, kiểm tra:

1. DNS đã trỏ đúng IP chưa.
2. Firewall có mở cổng `80` và `443` chưa.
3. Router/NAT có forward đúng không nếu VPS nằm trong mạng nội bộ.
4. Cloudflare proxy hoặc SSL mode có cấu hình đúng không.
5. Có Nginx khác trên host đang chiếm cổng `80/443` không.

Kiểm tra container đang publish cổng:

```bash
sudo docker ps --format 'table {{.Names}}\t{{.Ports}}' | grep nginx-service
```

---



## 13. Quy trình khi thay đổi cấu hình Nginx

Mở file:

```bash
sudo nano \
  /home/sdt-webserver/core/xtools/nginx-service/nginx/sites-enabled/Ggats.vn.conf
```

Sau khi sửa:

```bash
sudo docker exec nginx-service nginx -t
```

Nếu thành công:

```bash
sudo docker exec nginx-service nginx -s reload
```

Kiểm tra:

```bash
curl -I -H "Host: api.gats.vn" http://127.0.0.1
curl -I -H "Host: gats.vn" http://127.0.0.1
curl -I -H "Host: admin.gats.vn" http://127.0.0.1
```

Không restart hoặc recreate Nginx chỉ để áp dụng thay đổi nhỏ trong file `.conf`; reload là đủ.

---



## 14. Quy trình khi cập nhật chính nginx-service

```bash
cd /home/sdt-webserver/core/xtools/nginx-service

sudo docker compose config
sudo docker compose up -d --build
```

Sau khi container Nginx được recreate:

```bash
sudo docker inspect nginx-service \
  --format '{{range $name, $config := .NetworkSettings.Networks}}{{$name}}{{"\n"}}{{end}}'
```

Phải thấy:

```text
gats-academy_default
sdt-tools
```

Kiểm tra DNS Docker:

```bash
sudo docker exec nginx-service getent hosts app
```

Kiểm tra cấu hình:

```bash
sudo docker exec nginx-service nginx -t
```

Test domain:

```bash
curl -I -H "Host: api.gats.vn" http://127.0.0.1
curl -I -H "Host: gats.vn" http://127.0.0.1
curl -I -H "Host: admin.gats.vn" http://127.0.0.1
```

---



## 15. Quy trình deploy nhanh khuyến nghị

Dùng quy trình này cho đa số lần cập nhật code:

```bash
cd /home/sdt-webserver/GATS-ACADEMY

git pull

sudo docker compose up -d --build app

sudo docker compose ps
sudo docker compose logs --tail=100 app

sudo docker exec nginx-service getent hosts app
sudo docker exec nginx-service nginx -t
sudo docker exec nginx-service nginx -s reload

curl -I -H "Host: api.gats.vn" http://127.0.0.1
curl -I -H "Host: gats.vn" http://127.0.0.1
curl -I -H "Host: admin.gats.vn" http://127.0.0.1
```

---



## 16. Script deploy nhanh tùy chọn

Có thể tạo file:

```text
/home/sdt-webserver/GATS-ACADEMY/deploy-gats.sh
```

Nội dung:

```bash
#!/usr/bin/env bash
set -euo pipefail

GATS_DIR="/home/sdt-webserver/GATS-ACADEMY"
NGINX_CONTAINER="nginx-service"

cd "$GATS_DIR"

echo "==> Pull source code"
git pull

echo "==> Build and deploy app"
sudo docker compose up -d --build app

echo "==> Check containers"
sudo docker compose ps

echo "==> Check app logs"
sudo docker compose logs --tail=100 app

echo "==> Check Docker DNS"
sudo docker exec "$NGINX_CONTAINER" getent hosts app

echo "==> Validate Nginx"
sudo docker exec "$NGINX_CONTAINER" nginx -t

echo "==> Reload Nginx"
sudo docker exec "$NGINX_CONTAINER" nginx -s reload

echo "==> Test routes"
curl -fsSI -H "Host: api.gats.vn" http://127.0.0.1 | head
curl -fsSI -H "Host: gats.vn" http://127.0.0.1 | head
curl -fsSI -H "Host: admin.gats.vn" http://127.0.0.1 | head

echo "==> Deploy completed"
```

Cấp quyền:

```bash
chmod +x /home/sdt-webserver/GATS-ACADEMY/deploy-gats.sh
```

Chạy:

```bash
/home/sdt-webserver/GATS-ACADEMY/deploy-gats.sh
```

> Script dừng ngay khi một bước bị lỗi nhờ `set -euo pipefail`.

---



## 17. Checklist sau mỗi lần deploy

- [ ] `docker compose ps` cho thấy `app`, `db`, `redis`, `minio` đang chạy.
- [ ] `docker compose logs app` không có lỗi nghiêm trọng.
- [ ] `nginx-service` nằm trong `gats-academy_default`.
- [ ] `getent hosts app` trả về IP Docker.
- [ ] `nginx -t` thành công.
- [ ] Đã reload Nginx sau khi recreate `app`.
- [ ] `api.gats.vn` phản hồi.
- [ ] `gats.vn` trả `HTTP 200`.
- [ ] `admin.gats.vn` trả `HTTP 200`.
- [ ] Không còn file cấu hình trùng `server_name gats.vn`.
- [ ] Không dùng `docker compose down -v` nếu không chủ động xóa dữ liệu.

---



## 18. Tóm tắt lỗi thường gặp



### `host not found in upstream "app"`

Nguyên nhân:

- Nginx chưa tham gia `gats-academy_default`.
- Network bị mất sau khi recreate Nginx.
- Service `app` chưa chạy.

Kiểm tra:

```bash
sudo docker exec nginx-service getent hosts app
sudo docker compose -f /home/sdt-webserver/GATS-ACADEMY/docker-compose.yml ps
```



### `502 Bad Gateway`

Kiểm tra service:

```bash
cd /home/sdt-webserver/GATS-ACADEMY
sudo docker compose ps
sudo docker compose logs --tail=200 app
```

Kiểm tra cổng:

```bash
sudo docker run --rm \
  --network gats-academy_default \
  curlimages/curl:latest \
  -I http://app:3005
```

Nếu app vừa recreate, reload Nginx:

```bash
sudo docker exec nginx-service nginx -t
sudo docker exec nginx-service nginx -s reload
```



### Cảnh báo `conflicting server name`

Tìm file trùng:

```bash
sudo docker exec nginx-service sh -c \
  "grep -R 'server_name.*gats.vn' -n /etc/nginx 2>/dev/null || true"
```

Chỉ giữ cấu hình tại:

```text
/etc/nginx/sites-enabled/Ggats.vn.conf
```



### Nginx chạy nhưng domain sai ứng dụng

Kiểm tra Host header:

```bash
curl -I -H "Host: api.gats.vn" http://127.0.0.1
curl -I -H "Host: gats.vn" http://127.0.0.1
curl -I -H "Host: admin.gats.vn" http://127.0.0.1
```

Kiểm tra cấu hình thực tế Nginx đã load:

```bash
sudo docker exec nginx-service nginx -T
```

---



## 19. Trạng thái đã xác nhận ngày 20/07/2026

Các kiểm tra đã thành công:

```text
nginx-service -> Docker DNS app -> 172.22.0.5
app:3000 -> HTTP 302 /users
app:3005 -> HTTP 200
app:9000 -> HTTP 200
```

Kiểm tra qua Nginx:

```text
api.gats.vn   -> HTTP 302
gats.vn       -> HTTP 200
admin.gats.vn -> HTTP 200
```

Cấu hình Nginx:

```text
syntax is ok
test is successful
```

HTTP reverse proxy hiện đã hoạt động. Phần chứng chỉ HTTPS/Certbot cần được quản lý riêng và kiểm tra lại trước khi thay đổi cấu hình cổng `443`.