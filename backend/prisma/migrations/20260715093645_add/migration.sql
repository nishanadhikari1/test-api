-- CreateTable
CREATE TABLE `CookieJar` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `domain` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `path` VARCHAR(191) NOT NULL DEFAULT '/',
    `expires` DATETIME(3) NULL,
    `httpOnly` BOOLEAN NOT NULL DEFAULT false,
    `secure` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CookieJar_userId_domain_idx`(`userId`, `domain`),
    UNIQUE INDEX `CookieJar_userId_domain_name_path_key`(`userId`, `domain`, `name`, `path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CookieJar` ADD CONSTRAINT `CookieJar_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
