-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('APARTMENT', 'GARAGE');

-- AlterTable
ALTER TABLE "Apartment"
ADD COLUMN "unitType" "UnitType" NOT NULL DEFAULT 'APARTMENT',
ADD COLUMN "price" DECIMAL(12,2),
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN "roomCount" DECIMAL(3,1);

-- CreateIndex
CREATE INDEX "Apartment_unitType_idx" ON "Apartment"("unitType");
