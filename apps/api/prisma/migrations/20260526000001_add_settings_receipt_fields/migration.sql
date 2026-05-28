-- CreateTable (settings was never in the initial migration; create it with all columns)
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "store_name" TEXT NOT NULL,
    "store_logo" TEXT,
    "tax_percentage" DECIMAL(5,2) NOT NULL DEFAULT 11,
    "printer_name" TEXT,
    "auto_print" BOOLEAN NOT NULL DEFAULT false,
    "store_address" TEXT,
    "paper_width" TEXT DEFAULT '80mm',
    "receipt_footer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
