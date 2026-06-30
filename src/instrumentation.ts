export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { bootstrapSecureAuthAdmin } = await import("@/lib/auth/bootstrap-secure-auth-admin");
  await bootstrapSecureAuthAdmin();
}
