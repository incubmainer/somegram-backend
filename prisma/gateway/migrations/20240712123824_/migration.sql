/*
  Warnings:

  - A unique constraint covering the columns `[deviceId]` on the table `SecurityDevices` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SecurityDevices_userId_key";

-- AlterTable
ALTER TABLE "SecurityDevices" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SecurityDevices_deviceId_key" ON "SecurityDevices"("deviceId");
