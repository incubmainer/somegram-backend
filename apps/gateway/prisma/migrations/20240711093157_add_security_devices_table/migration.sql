-- CreateTable
CREATE TABLE "SecurityDevices" (
    "userId" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "lastActiveDate" TEXT NOT NULL,
    "title" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SecurityDevices_userId_key" ON "SecurityDevices"("userId");

-- CreateIndex
CREATE INDEX "SecurityDevices_deviceId_idx" ON "SecurityDevices"("deviceId");

-- AddForeignKey
ALTER TABLE "SecurityDevices" ADD CONSTRAINT "SecurityDevices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
