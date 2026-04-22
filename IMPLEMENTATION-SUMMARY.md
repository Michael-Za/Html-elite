# Careers Form Integration - Implementation Summary

## ✅ COMPLETED IN CRM (klickbee-crm-multi-tenant)

All files have been created in the CRM project:

### New Files Created:
- `src/lib/mysql/db.ts` - MySQL connection helper
- `src/lib/mysql/session.ts` - iron-session configuration
- `src/lib/mysql/mailer.ts` - Email notification helper
- `src/app/api/careers/route.ts` - Receive career applications
- `src/app/api/auth/login/route.ts` - Login endpoint
- `src/app/api/auth/logout/route.ts` - Logout endpoint
- `src/app/api/hiring/route.ts` - List applications with stats
- `src/app/api/hiring/[id]/route.ts` - Delete application (admin only)
- `src/app/api/hiring/[id]/status/route.ts` - Update status
- `src/app/api/hiring/[id]/voice/route.ts` - Stream voice notes
- `src/app/api/hiring/export/route.ts` - CSV export
- `src/app/login/page.tsx` - Login page
- `src/app/hiring/page.tsx` - Hiring dashboard
- `upload-video.php` - PHP script for Hostinger
- `careers-form-handler.js` - JavaScript handler for careers.html

### Dependencies Installed:
- mysql2
- formidable
- iron-session
- nodemailer

---

## 🔴 YOU MUST COMPLETE THESE STEPS

### STEP 1: Whitelist Vercel IPs in cPanel
1. Login to Hostinger cPanel
2. Go to **Remote MySQL**
3. Add these IPs:
   - `76.76.21.0/24`
   - `76.76.21.21`

### STEP 2: Run SQL in phpMyAdmin
```sql
-- CRM users
CREATE TABLE IF NOT EXISTS crm_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','MANAGER') NOT NULL DEFAULT 'MANAGER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO crm_users (name, email, password, role) VALUES
('Elite Admin', 'admin@elite.com', 'adelite@1', 'ADMIN'),
('Gaser', 'gasergamal93@gmail.com', 'Gaser@elite1', 'MANAGER'),
('Shahd', 'Shahdhanyyy456@gmail.com', 'shahdhany@elite1', 'MANAGER');

-- Career applications
CREATE TABLE IF NOT EXISTS hiring_applications (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(255) NOT NULL,
  age           INT,
  city          VARCHAR(255),
  email         VARCHAR(255) NOT NULL,
  whatsapp      VARCHAR(100),
  linkedin      VARCHAR(500),
  education     VARCHAR(255),
  current_status VARCHAR(100),
  field         VARCHAR(255),
  expertise_level VARCHAR(100),
  work_experience TEXT,
  english_level VARCHAR(50),
  other_skills  VARCHAR(500),
  cover_message TEXT,
  voice_note    MEDIUMBLOB,
  voice_note_name VARCHAR(255),
  voice_note_type VARCHAR(100),
  video_url     VARCHAR(1000),
  status        ENUM('New','Reviewing','Shortlisted','Rejected') DEFAULT 'New',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### STEP 3: Add Vercel Environment Variables
Go to Vercel → CRM project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| DB_HOST | (your cPanel hostname) |
| DB_PORT | 3306 |
| DB_NAME | (your database name) |
| DB_USER | (your database username) |
| DB_PASSWORD | (your database password) |
| SESSION_SECRET | elite2026superSecretKey!xK9mP3qZ12345678 |
| SMTP_HOST | mail.elitepartnersus.com |
| SMTP_PORT | 465 |
| SMTP_USER | admin@elite.com |
| SMTP_PASS | (email password) |
| HOSTINGER_UPLOAD_URL | https://elitepartnersus.com/upload-video.php |
| HOSTINGER_UPLOAD_SECRET | elite_upload_2026_xK9 |
| NEXT_PUBLIC_CRM_URL | https://crm.elitepartnersus.com |

### STEP 4: Upload PHP Script to Hostinger
1. Open cPanel File Manager
2. Navigate to public_html (root of elitepartnersus.com)
3. Upload `upload-video.php` from this project
4. Create folder: `uploads/videos/` with permissions 755

### STEP 5: Update careers.html on Main Website
1. Clone https://github.com/Michael-Za/Html-elite
2. Open `careers.html`
3. Find the `handleCareerSubmit` function
4. Replace it with the code from `careers-form-handler.js` in this project
5. Commit and push

---

## 🧪 TESTING CHECKLIST

1. [ ] cPanel Remote MySQL → Vercel IPs whitelisted
2. [ ] phpMyAdmin → Tables created, users inserted
3. [ ] Vercel → All 13 environment variables set
4. [ ] Hostinger → upload-video.php uploaded
5. [ ] Hostinger → uploads/videos/ folder created
6. [ ] Deploy CRM to Vercel
7. [ ] Visit https://crm.elitepartnersus.com/login
8. [ ] Login as admin@elite.com / adelite@1
9. [ ] Should redirect to /hiring
10. [ ] Test form submission from careers.html
11. [ ] Check email notification arrives

---

## 📋 USER CREDENTIALS

| Name | Email | Password | Role |
|------|-------|----------|------|
| Elite Admin | admin@elite.com | adelite@1 | ADMIN |
| Gaser | gasergamal93@gmail.com | Gaser@elite1 | MANAGER |
| Shahd | Shahdhanyyy456@gmail.com | shahdhany@elite1 | MANAGER |

---

## 🔗 API ENDPOINTS

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/careers | Submit application (public, CORS enabled) |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/hiring | List applications + stats |
| PATCH | /api/hiring/[id]/status | Update status |
| DELETE | /api/hiring/[id] | Delete (admin only) |
| GET | /api/hiring/[id]/voice | Stream voice note |
| GET | /api/hiring/export | CSV export |

---

## 🎨 FEATURES

- ✅ Stats dashboard (Total, New, Reviewing, Shortlisted, Rejected)
- ✅ Search by name, email, field
- ✅ Filter by status
- ✅ Inline audio player for voice notes
- ✅ Video link opens in new tab
- ✅ Status dropdown with instant update
- ✅ CSV export with current filters
- ✅ Pagination (25 per page)
- ✅ Admin-only delete button
- ✅ Manager can view/edit but not delete
- ✅ Email notification on new application
- ✅ CORS enabled for main website

---

Please provide your database credentials and confirm when you've completed steps 1-4 so I can finalize and push everything.
