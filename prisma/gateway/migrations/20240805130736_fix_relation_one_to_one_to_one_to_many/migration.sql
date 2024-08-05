/*
  Warnings:

  - You are about to drop the `PostsPhotos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPosts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostsPhotos" DROP CONSTRAINT "PostsPhotos_postId_fkey";

-- DropForeignKey
ALTER TABLE "UserPosts" DROP CONSTRAINT "UserPosts_userId_fkey";

-- DropTable
DROP TABLE "PostsPhotos";

-- DropTable
DROP TABLE "UserPosts";

-- CreateTable
CREATE TABLE "PostPhoto" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "photoKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "UserPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostPhoto_photoKey_idx" ON "PostPhoto"("photoKey");

-- AddForeignKey
ALTER TABLE "PostPhoto" ADD CONSTRAINT "PostPhoto_postId_fkey" FOREIGN KEY ("postId") REFERENCES "UserPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPost" ADD CONSTRAINT "UserPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
