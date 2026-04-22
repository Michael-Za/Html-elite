#!/bin/bash
# ============================================================================
# Elite Partners CRM - Hostinger Setup Script
# ============================================================================
# This script helps set up the careers integration on Hostinger
# 
# Usage: ./setup-hostinger.sh
# ============================================================================

HOSTINGER_API_KEY="BDqv4yjDWXBT9nCQTM9lV47gHLcV81ul4VGkKmGs50cbf499"
API_BASE="https://developers.hostinger.com"

echo "=========================================="
echo "Elite Partners CRM - Hostinger Setup"
echo "=========================================="
echo ""

# 1. Check Domain Info
echo "1. Checking domain information..."
curl -s -X GET "$API_BASE/api/domains/v1/portfolio/elitepartnersus.com" \
  -H "Authorization: Bearer $HOSTINGER_API_KEY" \
  -H "Content-Type: application/json" | jq .

echo ""

# 2. Check Hosting Info
echo "2. Checking hosting information..."
curl -s -X GET "$API_BASE/api/hosting/v1/websites" \
  -H "Authorization: Bearer $HOSTINGER_API_KEY" \
  -H "Content-Type: application/json" | jq .

echo ""

# 3. Check DNS Records
echo "3. Checking DNS records..."
curl -s -X GET "$API_BASE/api/dns/v1/zones/elitepartnersus.com" \
  -H "Authorization: Bearer $HOSTINGER_API_KEY" \
  -H "Content-Type: application/json" | jq .

echo ""
echo "=========================================="
echo "Setup Information"
echo "=========================================="
echo ""
echo "Hosting Account Details:"
echo "  Username: u184662983"
echo "  Main Domain: elitepartnersus.com"
echo "  Root Directory: /home/u184662983/domains/elitepartnersus.com/public_html"
echo ""
echo "=========================================="
echo "MANUAL STEPS REQUIRED"
echo "=========================================="
echo ""
echo "The Hostinger API does not support direct file uploads or MySQL database"
echo "management. Please complete the following steps manually:"
echo ""
echo "STEP 1: Create MySQL Database"
echo "  1. Log into Hostinger hPanel (https://hpanel.hostinger.com)"
echo "  2. Go to: Hosting → MySQL Databases"
echo "  3. Create a new database (e.g., u184662983_elite_crm)"
echo "  4. Create a database user with password"
echo "  5. Assign the user to the database with ALL PRIVILEGES"
echo ""
echo "STEP 2: Run SQL Schema"
echo "  1. Go to phpMyAdmin from hPanel"
echo "  2. Select your database"
echo "  3. Go to 'SQL' tab"
echo "  4. Copy and paste the contents of 'database-schema.sql'"
echo "  5. Click 'Go' to execute"
echo ""
echo "STEP 3: Upload PHP Script"
echo "  1. Go to File Manager in hPanel"
echo "  2. Navigate to public_html (root of elitepartnersus.com)"
echo "  3. Upload 'upload-video.php' to the root"
echo "  4. Create folder: public_html/uploads/videos/"
echo "  5. Set permissions on uploads/videos/ to 755"
echo ""
echo "STEP 4: Whitelist Vercel IPs"
echo "  1. Go to: Hosting → Remote MySQL"
echo "  2. Add Vercel IP ranges or use '%' to allow all"
echo ""
echo "STEP 5: Configure Vercel Environment Variables"
echo "  Add the following in Vercel project settings:"
echo "    DB_HOST=localhost (or your cPanel server)"
echo "    DB_NAME=u184662983_elite_crm"
echo "    DB_USER=<your-db-user>"
echo "    DB_PASSWORD=<your-db-password>"
echo ""
echo "STEP 6: Push Updated careers.html to GitHub"
echo "  The careers.html file has been updated in /home/z/Html-elite/"
echo "  Commit and push to: https://github.com/Michael-Za/Html-elite"
echo ""
echo "=========================================="
echo "Files Generated"
echo "=========================================="
echo "  /home/z/my-project/database-schema.sql - SQL schema"
echo "  /home/z/my-project/upload-video.php - PHP upload script"
echo "  /home/z/Html-elite/careers.html - Updated form"
echo "  /home/z/my-project/DEPLOYMENT.md - Full deployment guide"
echo ""
