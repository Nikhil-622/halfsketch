export const ADMIN_EMAILS = ["dishasondur26@gmail.com", "jadhavnikhil622@gmail.com"];

export function isAdminEmail(email: string | null | undefined) {
  return ADMIN_EMAILS.includes((email ?? "").trim().toLowerCase());
}
