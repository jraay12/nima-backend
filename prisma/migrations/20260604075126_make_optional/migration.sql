-- AlterTable
ALTER TABLE `Event` MODIFY `title` VARCHAR(191) NULL,
    MODIFY `badge` VARCHAR(191) NULL,
    MODIFY `start_time` VARCHAR(191) NULL,
    MODIFY `end_time` VARCHAR(191) NULL,
    MODIFY `event_date` DATETIME(3) NULL,
    MODIFY `venue` VARCHAR(191) NULL,
    MODIFY `city` VARCHAR(191) NULL,
    MODIFY `address` VARCHAR(191) NULL,
    MODIFY `state` VARCHAR(191) NULL,
    MODIFY `zipcode` INTEGER NULL;

-- AlterTable
ALTER TABLE `FeatureSpeaker` MODIFY `fullname` VARCHAR(191) NULL,
    MODIFY `role` VARCHAR(191) NULL,
    MODIFY `title` VARCHAR(191) NULL,
    MODIFY `speciality` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Sponsor` MODIFY `name` VARCHAR(191) NULL,
    MODIFY `link` VARCHAR(191) NULL;
