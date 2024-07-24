/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `UserAvatar` table. All the data in the column will be lost.
  - Added the required column `avatarKey` to the `UserAvatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `UserAvatar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserAvatar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserAvatar" DROP COLUMN "avatarUrl",
ADD COLUMN     "avatarKey" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
