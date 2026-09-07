import { config } from "dotenv";

/** يحمّل .env.local ثم .env — كما يفعل Next.js — للسكربتات خارج Next. */
config({ path: [".env.local", ".env"], quiet: true });
