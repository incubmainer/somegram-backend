/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `UserConfirmationToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserConfirmationToken_token_key" ON "UserConfirmationToken"("token");
