-- AlterTable
ALTER TABLE `Member` ADD COLUMN `speciality` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `MemberRenew` (
    `id` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `MemberRenew_memberId_idx`(`memberId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MemberRenew` ADD CONSTRAINT `MemberRenew_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
