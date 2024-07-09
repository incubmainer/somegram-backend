/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `User` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hashPassword` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isConfirmed` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "name",
DROP COLUMN "position",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "hashPassword" TEXT NOT NULL,
ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "username" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "UserConfirmationToken" (
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "UserResetPasswordCode" (
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserConfirmationToken_userId_key" ON "UserConfirmationToken"("userId");

-- CreateIndex
CREATE INDEX "UserConfirmationToken_token_idx" ON "UserConfirmationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserResetPasswordCode_userId_key" ON "UserResetPasswordCode"("userId");

-- CreateIndex
CREATE INDEX "UserResetPasswordCode_code_idx" ON "UserResetPasswordCode"("code");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "UserConfirmationToken" ADD CONSTRAINT "UserConfirmationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResetPasswordCode" ADD CONSTRAINT "UserResetPasswordCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
