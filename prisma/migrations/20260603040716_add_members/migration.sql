-- CreateTable
CREATE TABLE `Member` (
    `id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NULL,
    `practice_name` VARCHAR(191) NULL,
    `practice_email` VARCHAR(191) NULL,
    `practice_referral_email` VARCHAR(191) NULL,
    `practice_contact_number` VARCHAR(191) NULL,
    `fax_number` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `biography` JSON NULL,
    `image_path` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
