-- AlterTable
ALTER TABLE "battles" ALTER COLUMN "skip_state" SET DEFAULT ARRAY[]::UUID[];
