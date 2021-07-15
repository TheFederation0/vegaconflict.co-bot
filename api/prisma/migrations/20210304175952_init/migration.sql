-- CreateTable
CREATE TABLE `players` (
    `kxid` VARCHAR(191) NOT NULL,
    `alias` VARCHAR(191) NOT NULL,
    `rank` INTEGER NOT NULL,
    `medals` INTEGER NOT NULL DEFAULT 120000,
    `level` INTEGER NOT NULL DEFAULT 0,
    `planet` VARCHAR(191) NOT NULL DEFAULT '00000',
    `uid` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
UNIQUE INDEX `players.uid_unique`(`uid`),

    PRIMARY KEY (`kxid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
