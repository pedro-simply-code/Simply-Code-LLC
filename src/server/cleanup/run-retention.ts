import "~/env.js";
import {
  pruneExpiredRateLimits,
  pruneExpiredUploadClaims,
} from "~/server/cleanup/retention";
import { runNotificationRetention } from "~/server/notifications/retention";

const days = Number.parseInt(process.argv[2] ?? "90", 10);

Promise.all([
  runNotificationRetention(days).then((removed) => ({
    kind: "notifications",
    removed,
  })),
  pruneExpiredRateLimits().then((removed) => ({
    kind: "rate_limits",
    removed,
  })),
  pruneExpiredUploadClaims().then((removed) => ({
    kind: "upload_claims",
    removed,
  })),
])
  .then((results) => {
    for (const result of results) {
      console.log(`Removed ${result.removed} ${result.kind}(s).`);
    }
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
