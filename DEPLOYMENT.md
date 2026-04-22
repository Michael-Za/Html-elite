# Elite Partners CRM - Deployment Guide

## Overview
This document contains all the information needed to deploy the careers integration for Elite Partners.

---

## Step 1: Create MySQL Database on Hostinger

1. Log into cPanel on Hostinger
2. Go to **MySQL Databases**
3. Create a new database (e.g., `u123456789_elite_crm`)
4. Create a database user and assign it to the database
5. Note down the credentials:
   - DB_HOST: Your server hostname (e.g., `localhost` or the server IP)
   - DB_NAME: Database name
   - DB_USER: Database username
   - DB_PASSWORD: Database password

---

## Step 2: Run SQL Schema

1. Go to **phpMyAdmin** in cPanel
2. Select your database
3. Go to the **SQL** tab
4. Copy and paste the contents of `database-schema.sql`
5. Click **Go** to execute

This will create:
- `crm_users` table (for login accounts)
- `hiring_applications` table (for career applications)
- Default user accounts

---

## Step 3: Whitelist Vercel IPs (CRITICAL!)

For Vercel to connect to your MySQL database, you must whitelist Vercel's IP addresses:

1. Go to cPanel → **Remote MySQL**
2. Add the following IP addresses one by one:

```
Vercel IP Ranges (add these):
76.76.21.0/24
76.76.19.0/24
139.59.0.0/16
140.82.112.0/20
143.55.64.0/20
159.89.0.0/16
165.227.0.0/16
167.99.0.0/16
192.30.252.0/22
198.211.120.0/22
206.189.0.0/16
2604:A880:0:0::/64
2604:A880:1:0:0:0:0:0/64
2604:A880:2:0:0:0:0:0/64
```

**Note:** You can also add `%` as a wildcard host to allow all connections (less secure but works).

---

## Step 4: Upload PHP Script to Hostinger

1. Open **File Manager** in cPanel
2. Navigate to `public_html` (root of elitepartnersus.com)
3. Upload `upload-video.php` to the root
4. Create folder structure: `public_html/uploads/videos/`
5. Set permissions on `uploads/videos/` to `755`

---

## Step 5: Configure Environment Variables on Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add:

### Database Configuration
```
DB_HOST=localhost
DB_NAME=u123456789_elite_crm
DB_USER=u123456789_elite_user
DB_PASSWORD=your_database_password
DB_PORT=3306
```

### SMTP Configuration (Mailjet)
```
SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=587
SMTP_USER=1f0d9eec0f3b93b228ddda5c9aa1d852
SMTP_PASS=2b271be60f5992e9dbb89e9b60a3cdf1
SMTP_FROM=no-reply@elitepartnersus.com
```

### Session Configuration
```
SESSION_SECRET=your_random_32_character_secret_key_here
```

### Notification Emails (comma-separated)
```
NOTIFICATION_EMAILS=admin@elite.com,gasergamal93@gmail.com
```

---

## Step 6: Deploy to Vercel

1. Push your code to the connected Git repository
2. Vercel will automatically deploy
3. Check deployment logs for any errors

---

## Step 7: Update careers.html on Main Website

Update the `handleCareerSubmit` function in `careers.html` on elitepartnersus.com with the code in `careers-form-handler.js`.

---

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | superadmin@klickbee.com | superadmin2026! |
| ADMIN | admin@elite.com | Elite@admin2026! |
| MANAGER | gasergamal93@gmail.com | Elite@manager2026! |
| MANAGER | Shahdhanyyy456@gmail.com | Elite@manager2026! |

---

## API Endpoints

### Public (No Auth Required)
- `POST /api/careers` - Submit career application

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Hiring Management (Auth Required)
- `GET /api/hiring` - List applications (paginated)
- `PATCH /api/hiring/[id]/status` - Update status
- `DELETE /api/hiring/[id]` - Delete application (ADMIN only)
- `GET /api/hiring/[id]/voice` - Stream voice note
- `GET /api/hiring/export` - Export to CSV

---

## Pages

- `/login` - Login page
- `/hiring` - Hiring dashboard

---

## Troubleshooting

### Database Connection Errors
1. Verify DB credentials in Vercel env vars
2. Check if Vercel IPs are whitelisted in Remote MySQL
3. Try adding `%` as wildcard host in Remote MySQL

### Email Not Sending
1. Verify Mailjet SMTP credentials
2. Check sender domain is verified in Mailjet
3. Add `no-reply@elitepartnersus.com` as verified sender in Mailjet

### Video Upload Failing
1. Verify `upload-video.php` is uploaded to Hostinger
2. Check `uploads/videos/` folder exists with 755 permissions
3. Verify CORS headers allow requests from crm.elitepartnersus.com

---

## Security Notes

1. **Change default passwords** after first login
2. **Keep SMTP credentials secure** - they're visible in Vercel env vars
3. **Consider password hashing** - current implementation stores plain text passwords
4. **Rate limit** the `/api/careers` endpoint to prevent spam

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/lib/mysql/db.ts` | MySQL connection helper |
| `src/lib/mysql/session.ts` | iron-session configuration |
| `src/lib/mysql/mailer.ts` | Email notifications |
| `src/app/api/careers/route.ts` | Career form submission API |
| `src/app/api/auth/login/route.ts` | Login API |
| `src/app/api/auth/logout/route.ts` | Logout API |
| `src/app/api/hiring/route.ts` | List applications API |
| `src/app/api/hiring/[id]/status/route.ts` | Update status API |
| `src/app/api/hiring/[id]/route.ts` | Delete application API |
| `src/app/api/hiring/[id]/voice/route.ts` | Voice note streaming API |
| `src/app/api/hiring/export/route.ts` | CSV export API |
| `src/app/login/page.tsx` | Login page |
| `src/app/hiring/page.tsx` | Hiring dashboard |
| `upload-video.php` | PHP script for Hostinger |
| `careers-form-handler.js` | JavaScript for careers.html |
| `database-schema.sql` | MySQL schema |

---

## Need Help?

If you encounter any issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Test database connection from a tool like MySQL Workbench
