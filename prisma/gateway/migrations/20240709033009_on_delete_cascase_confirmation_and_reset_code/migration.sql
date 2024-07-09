-- DropForeignKey
ALTER TABLE "UserConfirmationToken" DROP CONSTRAINT "UserConfirmationToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserResetPasswordCode" DROP CONSTRAINT "UserResetPasswordCode_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserConfirmationToken" ADD CONSTRAINT "UserConfirmationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResetPasswordCode" ADD CONSTRAINT "UserResetPasswordCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
