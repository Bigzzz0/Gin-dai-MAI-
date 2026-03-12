-- AlterTable
ALTER TABLE "ScanHistory" ADD COLUMN     "userNote" TEXT;

-- CreateTable
CREATE TABLE "ScanFeedback" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScanFeedback_scanId_idx" ON "ScanFeedback"("scanId");

-- CreateIndex
CREATE INDEX "ScanFeedback_userId_idx" ON "ScanFeedback"("userId");

-- AddForeignKey
ALTER TABLE "ScanFeedback" ADD CONSTRAINT "ScanFeedback_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "ScanHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanFeedback" ADD CONSTRAINT "ScanFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
