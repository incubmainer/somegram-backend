/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `UserConfirmationToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `UserResetPasswordCode` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `SecurityDevices` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `lastActiveDate` on the `SecurityDevices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "SecurityDevices" ALTER COLUMN "userId" SET NOT NULL,
DROP COLUMN "lastActiveDate",
ADD COLUMN     "lastActiveDate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserConfirmationToken_token_key" ON "UserConfirmationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserResetPasswordCode_code_key" ON "UserResetPasswordCode"("code");
