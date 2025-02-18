/*
  Warnings:

  - Added the required column `userId` to the `PostPhoto` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PostPhoto" DROP CONSTRAINT "PostPhoto_postId_fkey";

-- AlterTable
ALTER TABLE "PostPhoto" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "postId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PostPhoto" ADD CONSTRAINT "PostPhoto_postId_fkey" FOREIGN KEY ("postId") REFERENCES "UserPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
