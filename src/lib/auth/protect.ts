import { verifyToken } from "./jwt";

/**
 * Verifica que el request venga de un admin autenticado con 2FA.
 * Retorna null si está autorizado, o un Response de error si no.
 */
export async function requireAdmin(): Promise<Response | null> {
  const session = await verifyToken();

  if (!session) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!session.twoFactorVerified) {
    return Response.json({ error: "2FA no verificado" }, { status: 403 });
  }

  return null;
}
