/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `UserResetPasswordCode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserResetPasswordCode_code_key" ON "UserResetPasswordCode"("code");
