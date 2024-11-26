/*
  Warnings:

  - You are about to drop the column `paymentSystemPaymentId` on the `PaymentTransaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentSystemOrderId" TEXT;

-- AlterTable
ALTER TABLE "PaymentTransaction" DROP COLUMN "paymentSystemPaymentId";
