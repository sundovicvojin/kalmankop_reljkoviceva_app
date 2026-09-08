import type { ApartmentStatus, UnitType } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export type PublicApartment = {
  id: string;
  externalId: string;
  number: string;
  floor: string;
  structure: string;
  totalArea: string;
  unitType: UnitType;
  price: string | null;
  currency: string;
  roomCount: string | null;
  status: ApartmentStatus;
  floorplanUrl: string | null;
  brochureUrl: string | null;
  interiorUrl: string | null;
};

export async function getApartments(): Promise<PublicApartment[]> {
  const prisma = getPrisma();
  const apartments = await prisma.apartment.findMany({
    orderBy: [{ number: "asc" }],
  });

  return apartments.map((apartment) => ({
    ...apartment,
    totalArea: apartment.totalArea.toFixed(2),
    price: apartment.price?.toFixed(2) ?? null,
    roomCount: apartment.roomCount?.toFixed(1) ?? null,
  }));
}
