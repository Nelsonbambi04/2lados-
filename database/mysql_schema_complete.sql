-- Dois Lados - MySQL schema generated from the active Flask/SQLAlchemy models.
-- Source of truth used: root models.py plus the active admin/app routes.
-- Target: MySQL 8.0+ / MariaDB with InnoDB and utf8mb4.

CREATE DATABASE IF NOT EXISTS `dois_lados`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `dois_lados`;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(80) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `password_hash` VARCHAR(256) NOT NULL,
  `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_username` (`username`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `category` VARCHAR(50) NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'orcamento',
  `client_id` INT NULL,
  `budget` DECIMAL(12,2) NULL,
  `location` VARCHAR(200) NULL,
  `area_sqm` DECIMAL(10,2) NULL,
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_projects_client_id` (`client_id`),
  KEY `ix_projects_status` (`status`),
  KEY `ix_projects_category` (`category`),
  CONSTRAINT `fk_projects_client_id`
    FOREIGN KEY (`client_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `project_phases` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `phase_name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `phase_order` INT NULL DEFAULT 1,
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'pendente',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_project_phases_project_id` (`project_id`),
  KEY `ix_project_phases_status` (`status`),
  CONSTRAINT `fk_project_phases_project_id`
    FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `project_images` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `caption` VARCHAR(200) NULL,
  `is_main` TINYINT(1) NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_project_images_project_id` (`project_id`),
  CONSTRAINT `fk_project_images_project_id`
    FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `project_documents` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `document_type` VARCHAR(30) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `file_url` VARCHAR(500) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(120) NULL,
  `amount` DECIMAL(12,2) NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'rascunho',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_project_documents_project_id` (`project_id`),
  KEY `ix_project_documents_document_type` (`document_type`),
  KEY `ix_project_documents_status` (`status`),
  CONSTRAINT `fk_project_documents_project_id`
    FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `ck_project_documents_document_type`
    CHECK (`document_type` IN ('planta', 'proposta', 'fatura', 'orcamento', 'contrato', 'relatorio', 'outro'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `quotes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `client_name` VARCHAR(100) NOT NULL,
  `client_email` VARCHAR(120) NOT NULL,
  `client_phone` VARCHAR(20) NULL,
  `service_type` VARCHAR(50) NOT NULL,
  `project_type` VARCHAR(50) NULL,
  `description` TEXT NOT NULL,
  `budget_range` VARCHAR(50) NULL,
  `location` VARCHAR(200) NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'pendente',
  `admin_notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` INT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_quotes_client_email` (`client_email`),
  KEY `ix_quotes_status` (`status`),
  KEY `ix_quotes_service_type` (`service_type`),
  KEY `ix_quotes_user_id` (`user_id`),
  CONSTRAINT `fk_quotes_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `subject` VARCHAR(200) NULL,
  `content` TEXT NOT NULL,
  `sender_role` VARCHAR(20) NOT NULL DEFAULT 'client',
  `attachment_url` VARCHAR(500) NULL,
  `attachment_name` VARCHAR(255) NULL,
  `attachment_type` VARCHAR(80) NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `is_replied` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_messages_user_id` (`user_id`),
  KEY `ix_messages_email` (`email`),
  KEY `ix_messages_is_read` (`is_read`),
  KEY `ix_messages_created_at` (`created_at`),
  CONSTRAINT `fk_messages_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `ck_messages_sender_role`
    CHECK (`sender_role` IN ('admin', 'client'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `portfolio_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `category` VARCHAR(50) NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `thumbnail_url` VARCHAR(500) NULL,
  `location` VARCHAR(100) NULL,
  `area_sqm` DECIMAL(10,2) NULL,
  `year` INT NULL,
  `is_featured` TINYINT(1) NULL DEFAULT 0,
  `is_active` TINYINT(1) NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_portfolio_items_category` (`category`),
  KEY `ix_portfolio_items_is_featured` (`is_featured`),
  KEY `ix_portfolio_items_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `publications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `summary` VARCHAR(300) NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(30) NOT NULL,
  `image_url` VARCHAR(500) NULL,
  `link_url` VARCHAR(500) NULL,
  `event_date` DATE NULL,
  `location` VARCHAR(150) NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_publications_category` (`category`),
  KEY `ix_publications_is_active` (`is_active`),
  KEY `ix_publications_is_featured` (`is_featured`),
  KEY `ix_publications_created_at` (`created_at`),
  CONSTRAINT `ck_publications_category`
    CHECK (`category` IN ('noticia', 'atividade', 'evento', 'publicidade', 'obra', 'recrutamento'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `newsletter` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(120) NOT NULL,
  `is_active` TINYINT(1) NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_newsletter_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `system_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_system_logs_user_id` (`user_id`),
  KEY `ix_system_logs_action` (`action`),
  KEY `ix_system_logs_created_at` (`created_at`),
  CONSTRAINT `fk_system_logs_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
