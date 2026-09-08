-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ApartmentStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD');

-- CreateTable
CREATE TABLE "Apartment" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "floor" TEXT NOT NULL,
    "structure" TEXT NOT NULL,
    "totalArea" DECIMAL(7,2) NOT NULL,
    "status" "ApartmentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "floorplanUrl" TEXT,
    "brochureUrl" TEXT,
    "interiorUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Apartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApartmentRoom" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" DECIMAL(7,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ApartmentRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Apartment_externalId_key" ON "Apartment"("externalId");

-- CreateIndex
CREATE INDEX "Apartment_status_idx" ON "Apartment"("status");

-- CreateIndex
CREATE INDEX "Apartment_number_idx" ON "Apartment"("number");

-- CreateIndex
CREATE INDEX "ApartmentRoom_apartmentId_sortOrder_idx" ON "ApartmentRoom"("apartmentId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ApartmentRoom" ADD CONSTRAINT "ApartmentRoom_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
