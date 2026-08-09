-- Fix missing Company columns
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "size" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "founded" TEXT;
