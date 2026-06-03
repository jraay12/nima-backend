-- AlterTable
ALTER TABLE `Member` ADD COLUMN `board_title` VARCHAR(191) NULL,
    ADD COLUMN `is_boardMember` BOOLEAN NOT NULL DEFAULT false;
