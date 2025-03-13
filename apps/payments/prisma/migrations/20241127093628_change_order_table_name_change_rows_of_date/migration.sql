/*
  Warnings:

  - You are about to drop the column `createdAt` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dateOfPayment` to the `PaymentTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDateOfSubscription` to the `PaymentTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subId` to the `PaymentTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PaymentTransaction" DROP CONSTRAINT "PaymentTransaction_orderId_fkey";

-- AlterTable
ALTER TABLE "PaymentTransaction" DROP COLUMN "createdAt",
DROP COLUMN "orderId",
DROP COLUMN "updatedAt",
ADD COLUMN     "dateOfPayment" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "endDateOfSubscription" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "subId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Order";

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionType" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "paymentCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "dateOfPayment" TIMESTAMP(3),
    "endDateOfSubscription" TIMESTAMP(3),
    "paymentSystemSubId" TEXT,
    "autoRenewal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_subId_fkey" FOREIGN KEY ("subId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
