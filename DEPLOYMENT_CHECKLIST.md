sudo apt update
sudo apt upgrade -y
```

- [ ] Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

- [ ] Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
```

- [ ] Install Nginx
```bash
sudo apt install -y nginx
```

### 2. Database Setup
- [ ] Configure PostgreSQL
```bash
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE icums;
CREATE USER icums_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE icums TO icums_user;
\q
```

### 3. Application Setup
- [ ] Create application directory
```bash
sudo mkdir -p /opt/icums
sudo chown $USER:$USER /opt/icums
cd /opt/icums
```

- [ ] Clone repository
```bash
git clone <your_repository_url> .
```

- [ ] Install dependencies
```bash
npm install
```

### 4. Environment Configuration
- [ ] Create .env file
```bash
nano .env
```

Required environment variables:
```env
# Database
DATABASE_URL=postgres://icums_user:your_secure_password@localhost:5432/icums

# Email (Gmail SMTP)
GMAIL_USER=johnlennarttimbal24@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password

# Session Secret
REPL_ID=your_secure_session_secret
```

### 5. Nginx Configuration
- [ ] Create Nginx config
```bash
sudo nano /etc/nginx/sites-available/icums
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

- [ ] Enable site configuration
```bash
sudo ln -s /etc/nginx/sites-available/icums /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. PM2 Process Manager Setup
- [ ] Install PM2 globally
```bash
sudo npm install -g pm2
```

- [ ] Create PM2 configuration
```bash
nano ecosystem.config.js
```

Add configuration:
```javascript
module.exports = {
  apps: [{
    name: 'icums',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

- [ ] Start application with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7. Security Setup
- [ ] Configure firewall
```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

- [ ] Install SSL certificate (optional but recommended)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

## Verification Checklist
- [ ] Database connection working
- [ ] Application running without errors
- [ ] Nginx serving the application
- [ ] WebSocket connections working
- [ ] Email notifications functioning (test with Gmail SMTP)
- [ ] SSL certificate installed (if applicable)

## Monitoring Setup
- [ ] PM2 monitoring configured
- [ ] Nginx logs accessible
- [ ] Application logs accessible

## Backup Procedures
- [ ] Database backup script created
- [ ] Regular backup schedule established
- [ ] Backup verification process documented

## Maintenance Notes
- Remember to regularly:
  - Update system packages
  - Monitor disk space
  - Check application logs
  - Verify backup integrity
  - Update SSL certificates (if applicable)

## Troubleshooting Commands
```bash
# Check application status
pm2 status
pm2 logs

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check database status
sudo systemctl status postgresql
sudo -u postgres psql -c "\l"

# View logs
tail -f /var/log/nginx/error.log
pm2 logs icums