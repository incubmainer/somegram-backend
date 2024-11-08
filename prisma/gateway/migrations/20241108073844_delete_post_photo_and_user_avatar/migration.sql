/*
  Warnings:

  - You are about to drop the `PostPhoto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAvatar` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostPhoto" DROP CONSTRAINT "PostPhoto_postId_fkey";

-- DropForeignKey
ALTER TABLE "UserAvatar" DROP CONSTRAINT "UserAvatar_userId_fkey";

-- DropTable
DROP TABLE "PostPhoto";

-- DropTable
DROP TABLE "UserAvatar";
