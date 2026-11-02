import { createRouteHandler } from "uploadthing/next";
import { env } from "~/env";
import { ourFileRouter } from "./core";

const appUrl =
  env.AUTH_URL?.replace(/\/$/, "") ??
  env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    callbackUrl: `${appUrl}/api/uploadthing`,
  },
});
