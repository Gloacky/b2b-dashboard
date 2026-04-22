-- CreateEnum
CREATE TYPE "ReportScheduleFrequency" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "ReportSchedule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "frequency" "ReportScheduleFrequency" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportSchedule_organizationId_active_idx" ON "ReportSchedule"("organizationId", "active");

-- CreateIndex
CREATE INDEX "ReportSchedule_active_nextRunAt_idx" ON "ReportSchedule"("active", "nextRunAt");

-- AddForeignKey
ALTER TABLE "ReportSchedule" ADD CONSTRAINT "ReportSchedule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
