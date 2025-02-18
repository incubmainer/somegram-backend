/*
  Warnings:

  - Made the column `userId` on table `SecurityDevices` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `lastActiveDate` on the `SecurityDevices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('Personal', 'Business');

-- AlterTable
ALTER TABLE "SecurityDevices" ALTER COLUMN "userId" SET NOT NULL,
DROP COLUMN "lastActiveDate",
ADD COLUMN     "lastActiveDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'Personal',
ADD COLUMN     "subscriptionExpireAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updateAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
