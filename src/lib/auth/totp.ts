import { TOTP } from "otpauth";

export function createTOTP(secret?: string, label?: string) {
  return new TOTP({
    issuer: "GoldAxis",
    label: label || "Admin",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret || undefined,
  });
}

export function verifyTOTPCode(secret: string, code: string): boolean {
  const totp = createTOTP(secret);
  const delta = totp.validate({ token: code, window: 1 });
  return delta !== null;
}
