import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n";

export default createMiddleware(routing);

export const config = {
  // Only intercept marketing routes — never dashboard, auth, api, or demo
  matcher: ["/", "/(fr|en|ru)/:path*"],
};
