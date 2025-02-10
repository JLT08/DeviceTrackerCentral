# Create database and user
sudo -u postgres psql

CREATE DATABASE icums;
CREATE USER icums_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE icums TO icums_user;
\q
```

### 3. Configure Nginx
Create a new Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/icums
```

Add the following configuration:
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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/icums /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Application Deployment

### 1. Create Application Directory
```bash
sudo mkdir -p /opt/icums
sudo chown $USER:$USER /opt/icums
```

### 2. Clone Repository
```bash
cd /opt/icums
git clone your_repository_url .
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Configuration
Create a .env file in /opt/icums:
```bash
nano .env
```

Add the following configuration:
```env
# Database
DATABASE_URL=postgres://icums_user:your_secure_password@localhost:5432/icums

# Email Configuration (Gmail)
GMAIL_USER=johnlennarttimbal24@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender@domain.com

# Session Secret
REPL_ID=your_secure_session_secret
```

### 5. Configure Gmail SMTP Email Service

1. Enable 2-Step Verification for your Gmail account:
   - Go to your Google Account settings (https://myaccount.google.com)
   - Click on "Security"
   - Enable "2-Step Verification" if not already enabled

2. Create an App Password:
   - Go to Google Account > Security
   - Under "2-Step Verification", scroll down and click on "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Name it "ICUMS Device Notifications"
   - Click "Generate"
   - Copy the 16-character password that appears

3. Add Gmail credentials to your environment:
```bash
nano .env
```

Add these lines to your .env file (already included above):
```env
# Email Configuration (Gmail)
GMAIL_USER=johnlennarttimbal24@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
```

4. Test email configuration:
```bash
# Check email logs
pm2 logs icums | grep "SMTP"

# You should see "SMTP server is ready to send emails"
# If there are errors, check your credentials and make sure 
# you're using the App Password, not your regular Gmail password
```

### 6. Configure SendGrid Email Service
1. Create a SendGrid account at https://sendgrid.com
2. Create an API key in SendGrid dashboard:
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Name it "ICUMS Device Notifications"
   - Select "Full Access" or "Restricted Access" with "Mail Send" permissions
   - Copy the generated API key

3. Verify your sender email:
   - Go to Settings > Sender Authentication
   - Complete either Domain Authentication or Single Sender Verification
   - Use the verified email address in SENDGRID_FROM_EMAIL

4. Test email configuration:
```bash
# Check email logs
pm2 logs icums | grep "Email"

# If using test mode (no SendGrid API key), you'll see email content in logs
# If using SendGrid, check your email inbox for notifications
```

### 7. Create Systemd Service
Create a service file:
```bash
sudo nano /etc/systemd/system/icums.service
```

Add the following configuration:
```ini
[Unit]
Description=ICUMS Infrastructure Management System
After=network.target postgresql.service

[Service]
Type=simple
User=your_user
WorkingDirectory=/opt/icums
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 8. Start the Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable icums
sudo systemctl start icums
```

## System Architecture Diagram
```
                                    ICUMS System Architecture
+----------------+     +-------------------+     +----------------------+
|                |     |                   |     |                      |
|   Nginx       +---->+   Node.js App     +---->+   PostgreSQL         |
|   (Reverse    |     |   (PM2 Managed)   |     |   Database          |
|    Proxy)     |     |                   |     |                      |
|               |     |                   |     |                      |
+-------+-------+     +--------+----------+     +----------------------+
        ^                      |
        |                      v
+-------+------------------+  +-----------------------+
|                         |  |                       |
|  HTTPS / SSL           |  |  SendGrid Email       |
|  (Let's Encrypt)       |  |  Service              |
|                         |  |                       |
+-------------------------+  +-----------------------+
```

## Troubleshooting

1. Check application status:
```bash
sudo systemctl status icums
```

2. Check if ports are in use:
```bash
sudo netstat -tulpn | grep LISTEN
```

3. Check Nginx configuration:
```bash
sudo nginx -t
```

4. Database connection issues:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log