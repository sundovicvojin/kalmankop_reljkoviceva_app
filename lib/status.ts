import type { ApartmentStatus } from "@prisma/client";

export const statusLabels: Record<ApartmentStatus, string> = {
  AVAILABLE: "Slobodan",
  RESERVED: "Rezervisan",
  SOLD: "Prodat",
};
