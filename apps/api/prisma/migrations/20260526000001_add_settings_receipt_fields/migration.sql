-- AlterTable
ALTER TABLE "settings" ADD COLUMN "store_address" TEXT,
ADD COLUMN "paper_width" TEXT DEFAULT '80mm',
ADD COLUMN "receipt_footer" TEXT;
