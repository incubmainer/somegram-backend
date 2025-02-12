-- CreateTable
CREATE TABLE "UserBanInfo" (
    "userId" TEXT NOT NULL,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT NOT NULL,
    "banDate" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBanInfo_userId_key" ON "UserBanInfo"("userId");

-- AddForeignKey
ALTER TABLE "UserBanInfo" ADD CONSTRAINT "UserBanInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
