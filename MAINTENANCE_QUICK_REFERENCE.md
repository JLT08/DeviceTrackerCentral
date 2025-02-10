# Start application
pm2 start icums

# Stop application
pm2 stop icums

# Restart application
pm2 restart icums
```

### View Logs
```bash
# Application logs
pm2 logs icums

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Database Operations
```bash
# Create backup
pg_dump -U icums_user icums > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U icums_user icums < backup.sql

# Connect to database
psql -U icums_user icums
```

### Update Application
```bash
cd /opt/icums
git pull
npm install
pm2 restart icums
```

### Common Issues

1. Application won't start:
   ```bash
   # Check logs
   pm2 logs icums
   # Check environment variables
   pm2 env icums
   ```

2. Database connection issues:
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   # Check connection
   psql -U icums_user -h localhost icums
   ```

3. Nginx issues:
   ```bash
   # Test configuration
   sudo nginx -t
   # Restart Nginx
   sudo systemctl restart nginx
   ```

### System Maintenance
```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Check disk space
df -h

# Check memory usage
free -m

# Check running services
systemctl status