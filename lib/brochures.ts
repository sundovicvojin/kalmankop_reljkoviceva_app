import { readdir } from "node:fs/promises";
import path from "node:path";

const brochureExtensions = ["pdf", "jpg", "jpeg", "png", "webp"];

export type Brochure = {
  fileUrl: string;
  kind: "pdf" | "image";
};

// Brosura moze biti pdf, jpg, png ili webp: `public/brochures/<externalId>.<ext>`.
export async function findBrochure(externalId: string): Promise<Brochure | null> {
  if (!/^[A-Za-z0-9_-]+$/.test(externalId)) {
    return null;
  }

  let files: string[];
  try {
    files = await readdir(path.join(process.cwd(), "public", "brochures"));
  } catch {
    return null;
  }

  for (const extension of brochureExtensions) {
    const fileName = `${externalId}.${extension}`;
    if (files.includes(fileName)) {
      return { fileUrl: `/brochures/${fileName}`, kind: extension === "pdf" ? "pdf" : "image" };
    }
  }

  return null;
}
