/** Matches @tgoliveira/outpost admin handler forbidden detection (error.name). */
export function outpostAdminForbidden(message: string): Error {
  const error = new Error(message);
  error.name = "AdminForbiddenError";
  return error;
}
