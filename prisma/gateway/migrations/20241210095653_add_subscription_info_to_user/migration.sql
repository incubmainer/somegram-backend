-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('Personal', 'Business');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'Personal',
ADD COLUMN     "subscriptionExpireAt" TIMESTAMP(3);
