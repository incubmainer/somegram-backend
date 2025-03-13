-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionType" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "paymentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransactions" (
    "id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "paymentSystem" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Orders_paymentId_key" ON "Orders"("paymentId");

-- CreateIndex
CREATE INDEX "Orders_userId_idx" ON "Orders"("userId");

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentTransactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
