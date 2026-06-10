import { TOTP } from "otpauth";
import fs from "fs/promises";
import path from "path";

const ENV_PATH = path.join(process.cwd(), ".env.local");

export function createTOTP(secret?: string) {
  return new TOTP({
    issuer: "GoldAxis",
    label: "Admin",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret || undefined,
  });
}

export async function getTOTPSecret(): Promise<string | null> {
  try {
    const env = await fs.readFile(ENV_PATH, "utf-8");
    const match = env.match(/^TOTP_SECRET=(.+)$/m);
    return match?.[1]?.trim() || null;
  } catch {
    return null;
  }
}

export async function saveTOTPSecret(secret: string): Promise<void> {
  try {
    let env = await fs.readFile(ENV_PATH, "utf-8");
    if (env.includes("TOTP_SECRET=")) {
      env = env.replace(/^TOTP_SECRET=.*$/m, `TOTP_SECRET=${secret}`);
    } else {
      env += `\nTOTP_SECRET=${secret}`;
    }
    await fs.writeFile(ENV_PATH, env, "utf-8");
  } catch {
    throw new Error("No se pudo guardar el secreto TOTP");
  }
}

export function verifyTOTPCode(secret: string, code: string): boolean {
  const totp = createTOTP(secret);
  const delta = totp.validate({ token: code, window: 1 });
  return delta !== null;
}
