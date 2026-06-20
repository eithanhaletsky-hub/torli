export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard", "/calendar", "/clients", "/services", "/settings"],
};
