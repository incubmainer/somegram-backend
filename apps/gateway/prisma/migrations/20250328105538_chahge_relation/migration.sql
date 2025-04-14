-- DropIndex
DROP INDEX "UserFollow_followeeId_idx";

-- CreateIndex
CREATE INDEX "UserFollow_followeeId_followerId_idx" ON "UserFollow"("followeeId", "followerId");
