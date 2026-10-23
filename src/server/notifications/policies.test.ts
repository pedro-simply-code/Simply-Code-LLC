import { describe, expect, it } from "vitest";
import { allowedNotificationTypes, isNotificationTypeAllowed } from "~/server/notifications/policies";

describe("notification policies", () => {
  it("hides contact notifications in the portal", () => {
    expect(allowedNotificationTypes("portal")).not.toContain("contact");
    expect(isNotificationTypeAllowed("contact", "portal")).toBe(false);
    expect(isNotificationTypeAllowed("project", "portal")).toBe(true);
  });

  it("allows all types in studio", () => {
    expect(isNotificationTypeAllowed("contact", "studio")).toBe(true);
  });
});
