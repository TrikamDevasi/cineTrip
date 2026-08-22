import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Returns the authenticated NextAuth session for a server-side request.
 * Throws a structured 401-ready error if no session exists.
 *
 * Usage in API routes:
 *   const session = await getSession(request);
 *   // session.user.id, session.user.role are guaranteed
 */
export async function getSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    const err = new Error("Unauthenticated");
    err.status = 401;
    throw err;
  }

  return session;
}

/**
 * Returns true if the authenticated user has the "admin" role.
 * Returns false (does NOT throw) so callers can decide the response.
 */
export async function isAdmin() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.role === "admin";
  } catch {
    return false;
  }
}

/**
 * Returns the session if the user is an admin, otherwise throws a 403 error.
 * Convenience wrapper for admin-only API routes.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    const err = new Error("Unauthenticated");
    err.status = 401;
    throw err;
  }

  if (session.user.role !== "admin") {
    const err = new Error("Forbidden: admin access required");
    err.status = 403;
    throw err;
  }

  return session;
}
