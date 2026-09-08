import { loadEnvFile } from "process";
import { PrismaClient, ApartmentStatus, UnitType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

loadEnvFile();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for seed.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const apartments = [
  ["APT_01", "01", "Prizemlje", "dvosoban", "54.80", "2.0", "164400.00", UnitType.APARTMENT, ApartmentStatus.AVAILABLE],
  ["APT_02", "02", "Prizemlje", "trosoban", "72.35", "3.0", "217050.00", UnitType.APARTMENT, ApartmentStatus.RESERVED],
  ["APT_03", "03", "I sprat", "dvosoban", "64.20", "2.0", "192600.00", UnitType.APARTMENT, ApartmentStatus.AVAILABLE],
  ["APT_04", "04", "I sprat", "cetvorosoban", "91.10", "4.0", "273300.00", UnitType.APARTMENT, ApartmentStatus.SOLD],
  ["APT_05", "05", "II sprat", "trosoban", "76.45", "3.0", "229350.00", UnitType.APARTMENT, ApartmentStatus.AVAILABLE],
  ["APT_06", "06", "II sprat", "dvosoban", "58.90", "2.0", "176700.00", UnitType.APARTMENT, ApartmentStatus.RESERVED],
  ["APT_07", "07", "III sprat", "trosoban", "80.15", "3.0", "240450.00", UnitType.APARTMENT, ApartmentStatus.AVAILABLE],
  ["APT_08", "08", "III sprat", "cetvorosoban", "96.60", "4.0", "289800.00", UnitType.APARTMENT, ApartmentStatus.SOLD],
  ["APT_09", "09", "Povuceni sprat", "trosoban", "84.25", "3.0", "252750.00", UnitType.APARTMENT, ApartmentStatus.AVAILABLE],
] as const;

async function main() {
  for (const [externalId, number, floor, structure, totalArea, roomCount, price, unitType, status] of apartments) {
    await prisma.apartment.upsert({
      where: { externalId },
      update: { number, floor, structure, totalArea, roomCount, price, unitType, status },
      create: {
        externalId,
        number,
        floor,
        structure,
        totalArea,
        roomCount,
        price,
        currency: "EUR",
        unitType,
        status,
        floorplanUrl: "/floorplans/apartment-placeholder.svg",
        brochureUrl: number === "04" ? null : `https://kalmankop.rs/brosure/reljkoviceva-59-stan-${number}.pdf`,
        interiorUrl: ["03", "05", "09"].includes(number) ? `https://kalmankop.rs/reljkoviceva-59/stan-${number}` : null,
        rooms: {
          create: [
            { name: "Dnevna zona", area: "24.00", sortOrder: 1 },
            { name: "Spavaca soba", area: "12.40", sortOrder: 2 },
            { name: "Kupatilo", area: "5.10", sortOrder: 3 },
          ],
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
