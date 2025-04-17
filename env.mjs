import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    ANALYZE: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url().default("https://localhost:443"),
    NEXT_PUBLIC_API_KEY: z.string().default("https://api.example.com"),
    NEXT_PUBLIC_AUTH_DOMAIN: z.string().default("https://api.example.com"),
    NEXT_PUBLIC_PROJECT_ID: z.string().default("https://api.example.com"),
    NEXT_PUBLIC_STORAGE_BUCKET: z.string().default("https://api.example.com"),
    NEXT_PUBLIC_MESSAGING_SENDER_ID: z.string().default("https://api.example.com"),
    NEXT_PUBLIC_APP_ID: z.string().default("https://api.example.com"),
  },
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:443",
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY || "https://api.example.com",
    NEXT_PUBLIC_AUTH_DOMAIN: process.env.NEXT_PUBLIC_AUTH_DOMAIN || "https://api.example.com",
    NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID || "https://api.example.com",
    NEXT_PUBLIC_STORAGE_BUCKET: process.env.NEXT_PUBLIC_STORAGE_BUCKET || "https://api.example.com",
    NEXT_PUBLIC_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID || "https://api.example.com",
    NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID || "https://api.example.com",
  },
})