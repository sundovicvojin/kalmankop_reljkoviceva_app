"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApartmentStatus, UnitType } from "@prisma/client";
import type { LoginState } from "@/lib/actions/types";
import { getPrisma } from "@/lib/prisma";
import { ADMIN_ROUTE } from "@/lib/admin-config";
import {
  clearRateLimit,
  createSession,
  destroySession,
  isAdminAuthenticated,
  isRateLimited,
  validateCredentials,
} from "@/lib/auth";

export async function loginAction(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip");

  if (isRateLimited(ip, username)) {
    return { error: "Prijava trenutno nije uspela." };
  }

  try {
    const ok = await validateCredentials(username, password);
    if (!ok) {
      return { error: "Prijava trenutno nije uspela." };
    }

    clearRateLimit(ip, username);
    await createSession();
  } catch {
    return { error: "Prijava trenutno nije uspela." };
  }

  redirect(ADMIN_ROUTE);
}

export async function logoutAction() {
  await destroySession();
  redirect(`${ADMIN_ROUTE}/login`);
}

export async function updateApartment(formData: FormData) {
  const authorized = await isAdminAuthenticated();
  if (!authorized) {
    redirect(`${ADMIN_ROUTE}/login`);
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const unitType = String(formData.get("unitType") ?? "");
  const number = String(formData.get("number") ?? "").trim();
  const floor = String(formData.get("floor") ?? "").trim();
  const structure = String(formData.get("structure") ?? "").trim();
  const totalArea = decimalValue(formData.get("totalArea"));
  const roomCount = decimalValue(formData.get("roomCount"));
  const price = decimalValue(formData.get("price"));
  const currency = String(formData.get("currency") ?? "EUR").trim() || "EUR";

  if (!Object.values(ApartmentStatus).includes(status as ApartmentStatus)) {
    throw new Error("Invalid apartment status.");
  }

  if (!Object.values(UnitType).includes(unitType as UnitType)) {
    throw new Error("Invalid unit type.");
  }

  if (!id || !number || !floor || !structure || !totalArea) {
    throw new Error("Required apartment data is missing.");
  }

  const prisma = getPrisma();
  await prisma.apartment.update({
    where: { id },
    data: {
      number,
      floor,
      structure,
      totalArea,
      roomCount,
      price,
      currency,
      unitType: unitType as UnitType,
      status: status as ApartmentStatus,
    },
  });

  revalidatePath("/");
  revalidatePath(ADMIN_ROUTE);
}

function decimalValue(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  return normalized ? normalized : null;
}
