-- Migration: 0001_initial
-- MySQL DDL for Subject -> SubjectYear -> Book -> PdfFile -> Chapter -> Subchapter

-- CreateTable: users
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'EDITOR', 'USER') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: subjects
CREATE TABLE IF NOT EXISTS `subjects` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(140) NOT NULL,
    `description` TEXT NULL,
    `sortOrder` INT NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `subjects_slug_key`(`slug`),
    INDEX `subjects_isActive_sortOrder_idx`(`isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: subject_years
CREATE TABLE IF NOT EXISTS `subject_years` (
    `id` VARCHAR(36) NOT NULL,
    `subjectId` VARCHAR(36) NOT NULL,
    `year` INT NOT NULL,
    `sortOrder` INT NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `subject_years_subjectId_year_key`(`subjectId`, `year`),
    INDEX `subject_years_subjectId_sortOrder_idx`(`subjectId`, `sortOrder`),
    PRIMARY KEY (`id`),
    CONSTRAINT `subject_years_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: books
CREATE TABLE IF NOT EXISTS `books` (
    `id` VARCHAR(36) NOT NULL,
    `subjectYearId` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(280) NOT NULL,
    `description` TEXT NULL,
    `language` VARCHAR(10) NOT NULL DEFAULT 'en',
    `coverUrl` VARCHAR(512) NULL,
    `status` ENUM('DRAFT', 'PROCESSING', 'PUBLISHED', 'FAILED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `isPaid` BOOLEAN NOT NULL DEFAULT false,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `totalPages` INT NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `books_slug_key`(`slug`),
    INDEX `books_subjectYearId_idx`(`subjectYearId`),
    INDEX `books_status_idx`(`status`),
    INDEX `books_isPaid_idx`(`isPaid`),
    INDEX `books_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `books_subjectYearId_fkey` FOREIGN KEY (`subjectYearId`) REFERENCES `subject_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: pdf_files
CREATE TABLE IF NOT EXISTS `pdf_files` (
    `id` VARCHAR(36) NOT NULL,
    `bookId` VARCHAR(36) NOT NULL,
    `version` INT NOT NULL DEFAULT 1,
    `originalName` VARCHAR(255) NOT NULL,
    `storageKey` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(64) NOT NULL DEFAULT 'application/pdf',
    `fileSize` BIGINT NOT NULL,
    `sha256` VARCHAR(64) NOT NULL,
    `totalPages` INT NOT NULL DEFAULT 0,
    `hasOutline` BOOLEAN NOT NULL DEFAULT false,
    `outlineExtractedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `pdf_files_storageKey_key`(`storageKey`),
    UNIQUE INDEX `pdf_files_bookId_version_key`(`bookId`, `version`),
    INDEX `pdf_files_bookId_idx`(`bookId`),
    INDEX `pdf_files_sha256_idx`(`sha256`),
    PRIMARY KEY (`id`),
    CONSTRAINT `pdf_files_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: chapters
CREATE TABLE IF NOT EXISTS `chapters` (
    `id` VARCHAR(36) NOT NULL,
    `bookId` VARCHAR(36) NOT NULL,
    `parentId` VARCHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `chapterNumber` INT NULL,
    `sortOrder` INT NOT NULL DEFAULT 0,
    `pageIndex` INT NOT NULL DEFAULT 0,
    `pageNumber` INT NOT NULL DEFAULT 1,
    `destinationX` DECIMAL(8, 2) NULL,
    `destinationY` DECIMAL(8, 2) NULL,
    `level` INT NOT NULL DEFAULT 1,
    `source` ENUM('PDF_OUTLINE', 'TEXT_EXTRACTION', 'OCR', 'MANUAL', 'AI') NOT NULL DEFAULT 'PDF_OUTLINE',
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `chapters_bookId_sortOrder_idx`(`bookId`, `sortOrder`),
    INDEX `chapters_bookId_parentId_idx`(`bookId`, `parentId`),
    INDEX `chapters_pageIndex_idx`(`pageIndex`),
    PRIMARY KEY (`id`),
    CONSTRAINT `chapters_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `chapters_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `chapters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: pdf_processing_jobs
CREATE TABLE IF NOT EXISTS `pdf_processing_jobs` (
    `id` VARCHAR(36) NOT NULL,
    `bookId` VARCHAR(36) NOT NULL,
    `pdfFileId` VARCHAR(36) NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `attempts` INT NOT NULL DEFAULT 0,
    `errorMessage` TEXT NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `pdf_processing_jobs_bookId_idx`(`bookId`),
    INDEX `pdf_processing_jobs_pdfFileId_idx`(`pdfFileId`),
    INDEX `pdf_processing_jobs_status_idx`(`status`),
    INDEX `pdf_processing_jobs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `pdf_processing_jobs_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `pdf_processing_jobs_pdfFileId_fkey` FOREIGN KEY (`pdfFileId`) REFERENCES `pdf_files`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: bookmarks
CREATE TABLE IF NOT EXISTS `bookmarks` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `bookId` VARCHAR(36) NOT NULL,
    `chapterId` VARCHAR(36) NULL,
    `pageIndex` INT NOT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `bookmarks_userId_bookId_pageIndex_key`(`userId`, `bookId`, `pageIndex`),
    INDEX `bookmarks_userId_idx`(`userId`),
    INDEX `bookmarks_bookId_idx`(`bookId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `bookmarks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `bookmarks_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `bookmarks_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: highlights
CREATE TABLE IF NOT EXISTS `highlights` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `bookId` VARCHAR(36) NOT NULL,
    `pageIndex` INT NOT NULL,
    `text` TEXT NOT NULL,
    `color` VARCHAR(16) NOT NULL DEFAULT '#FDE047',
    `position` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `highlights_userId_bookId_idx`(`userId`, `bookId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `highlights_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `highlights_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: reading_progress
CREATE TABLE IF NOT EXISTS `reading_progress` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `bookId` VARCHAR(36) NOT NULL,
    `currentPage` INT NOT NULL DEFAULT 0,
    `lastChapterId` VARCHAR(36) NULL,
    `progress` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `reading_progress_userId_bookId_key`(`userId`, `bookId`),
    INDEX `reading_progress_userId_idx`(`userId`),
    INDEX `reading_progress_bookId_idx`(`bookId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `reading_progress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `reading_progress_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: entitlements
CREATE TABLE IF NOT EXISTS `entitlements` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `bookId` VARCHAR(36) NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'REVOKED') NOT NULL DEFAULT 'ACTIVE',
    `purchasedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,
    `paymentReference` VARCHAR(128) NULL,
    UNIQUE INDEX `entitlements_userId_bookId_key`(`userId`, `bookId`),
    INDEX `entitlements_userId_idx`(`userId`),
    INDEX `entitlements_bookId_idx`(`bookId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `entitlements_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `entitlements_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: audit_logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` VARCHAR(36) NOT NULL,
    `actorId` VARCHAR(36) NULL,
    `action` VARCHAR(64) NOT NULL,
    `entityType` VARCHAR(64) NOT NULL,
    `entityId` VARCHAR(64) NOT NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `audit_logs_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `audit_logs_actorId_idx`(`actorId`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
