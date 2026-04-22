-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "status" "InviteStatus" NOT NULL DEFAULT 'PENDING';
