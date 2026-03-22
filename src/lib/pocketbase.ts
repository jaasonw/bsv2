"use client";

import PocketBase from "pocketbase";

const PB_URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";

let pb: PocketBase | null = null;

export function getPocketBase(): PocketBase {
  if (typeof window === "undefined") {
    throw new Error("PocketBase client can only be used in browser");
  }

  if (!pb) {
    pb = new PocketBase(PB_URL);
    pb.autoCancellation(false);

    // Load auth from localStorage if exists
    const authData = localStorage.getItem("pb_auth");
    if (authData) {
      try {
        pb.authStore.loadFromCookie(authData);
      } catch {
        localStorage.removeItem("pb_auth");
      }
    }

    // Save auth changes to localStorage
    pb.authStore.onChange(() => {
      localStorage.setItem("pb_auth", pb!.authStore.exportToCookie());
    });
  }

  return pb;
}

export function clearPocketBase(): void {
  if (pb) {
    pb.authStore.clear();
    pb = null;
  }
  localStorage.removeItem("pb_auth");
}

export type { PocketBase };
