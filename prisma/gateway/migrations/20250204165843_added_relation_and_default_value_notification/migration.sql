-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "isRead" SET DEFAULT false;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
