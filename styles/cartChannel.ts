// src/lib/cartChannel.ts
export const cartChannel =
  typeof window !== "undefined" ? new BroadcastChannel("cartUpdated") : null;
