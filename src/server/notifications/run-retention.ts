import "~/env.js";
import { runNotificationRetention } from "~/server/notifications/retention";

const days = Number.parseInt(process.argv[2] ?? "90", 10);

runNotificationRetention(days)
  .then((removed) => {
    console.log(`Removed ${removed} notification(s).`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
