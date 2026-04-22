-- ============================================================================
-- ELITE PARTNERS CRM - MySQL DATABASE SCHEMA
-- ============================================================================
-- 
-- INSTRUCTIONS:
-- 1. Log into cPanel on Hostinger
-- 2. Go to phpMyAdmin
-- 3. Select your database
-- 4. Go to "SQL" tab
-- 5. Paste and run this entire script
--
-- ============================================================================

-- ============================================================================
-- TABLE: crm_users
-- Stores CRM user accounts (admins and managers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS crm_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'MANAGER') NOT NULL DEFAULT 'MANAGER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE: hiring_applications
-- Stores career applications from elitepartnersus.com
-- ============================================================================
CREATE TABLE IF NOT EXISTS hiring_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  age INT NULL,
  city VARCHAR(100) NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NULL,
  linkedin VARCHAR(500) NULL,
  education VARCHAR(255) NULL,
  current_status VARCHAR(100) NULL,
  field VARCHAR(100) NULL,
  expertise_level VARCHAR(50) NULL,
  work_experience TEXT NULL,
  english_level VARCHAR(50) NULL,
  other_skills TEXT NULL,
  cover_message TEXT NULL,
  voice_note MEDIUMBLOB NULL,
  voice_note_name VARCHAR(255) NULL,
  voice_note_type VARCHAR(100) NULL,
  video_url VARCHAR(500) NULL,
  status ENUM('New', 'Reviewing', 'Shortlisted', 'Rejected') NOT NULL DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DEFAULT USERS
-- Passwords are stored as plain text for simplicity (can be hashed later)
-- ============================================================================
-- SUPER ADMIN (for klickbee.com)
INSERT INTO crm_users (name, email, password, role) VALUES
  ('Super Admin', 'superadmin@klickbee.com', 'superadmin2026!', 'ADMIN')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ADMIN for Elite Partners
INSERT INTO crm_users (name, email, password, role) VALUES
  ('Admin Elite', 'admin@elite.com', 'Elite@admin2026!', 'ADMIN')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- MANAGERS for Elite Partners
INSERT INTO crm_users (name, email, password, role) VALUES
  ('Gaser Gamal', 'gasergamal93@gmail.com', 'Elite@manager2026!', 'MANAGER')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO crm_users (name, email, password, role) VALUES
  ('Shahd Hany', 'Shahdhanyyy456@gmail.com', 'Elite@manager2026!', 'MANAGER')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these to verify the setup
-- ============================================================================
-- SELECT * FROM crm_users;
-- SELECT * FROM hiring_applications LIMIT 5;
-- SHOW TABLES;

-- ============================================================================
-- DONE!
-- ============================================================================
