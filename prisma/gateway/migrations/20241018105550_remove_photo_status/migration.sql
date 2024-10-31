/*
  Warnings:

  - You are about to drop the column `status` on the `PostPhoto` table. All the data in the column will be lost.
  - Made the column `postId` on table `PostPhoto` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PostPhoto" DROP CONSTRAINT "PostPhoto_postId_fkey";

-- AlterTable
ALTER TABLE "PostPhoto" DROP COLUMN "status",
ALTER COLUMN "postId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "PostPhoto" ADD CONSTRAINT "PostPhoto_postId_fkey" FOREIGN KEY ("postId") REFERENCES "UserPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
