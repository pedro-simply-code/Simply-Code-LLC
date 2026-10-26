import { describe, expect, it } from "vitest";
import {
  canManageProject,
  canPublishClientVisibleUpdate,
  canViewStudioProject,
} from "~/server/authz/policies";

describe("canPublishClientVisibleUpdate", () => {
  it("allows founders", () => {
    expect(canPublishClientVisibleUpdate("founder", null)).toBe(true);
  });

  it("allows project leads", () => {
    expect(
      canPublishClientVisibleUpdate("developer", { projectRole: "lead" }),
    ).toBe(true);
  });

  it("denies plain developers", () => {
    expect(
      canPublishClientVisibleUpdate("developer", { projectRole: "developer" }),
    ).toBe(false);
  });
});

describe("canManageProject", () => {
  it("matches lead/founder rules", () => {
    expect(canManageProject("lead", { projectRole: "developer" })).toBe(false);
    expect(canManageProject("lead", { projectRole: "lead" })).toBe(true);
    expect(canManageProject("founder", null)).toBe(true);
  });
});

describe("canViewStudioProject", () => {
  it("allows any assigned member", () => {
    expect(
      canViewStudioProject("developer", { projectRole: "developer" }),
    ).toBe(true);
  });

  it("denies unassigned non-founders", () => {
    expect(canViewStudioProject("developer", null)).toBe(false);
  });
});
