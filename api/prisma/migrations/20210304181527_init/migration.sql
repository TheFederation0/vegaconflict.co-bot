-- DropIndex
DROP INDEX `players.uid_unique` ON `players`;

-- AlterTable
ALTER TABLE `players` MODIFY `planet` VARCHAR(191) NOT NULL DEFAULT '000000';
