import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { MESSAGE_ATTACHMENT_MAX_COUNT } from "~/lib/message-attachments";
import { auth } from "~/lib/auth";
import { isTeam } from "~/lib/roles";
import { userHasStudioProjectAccess } from "~/server/authz/project-access";
import { registerUserUploadClaim } from "~/server/uploads/claims";
const f = createUploadthing();

const messageAttachmentLimits = {
  image: { maxFileSize: "8MB", maxFileCount: MESSAGE_ATTACHMENT_MAX_COUNT },
  pdf: { maxFileSize: "8MB", maxFileCount: MESSAGE_ATTACHMENT_MAX_COUNT },
  blob: { maxFileSize: "8MB", maxFileCount: MESSAGE_ATTACHMENT_MAX_COUNT },
} as const;

export const ourFileRouter = {
  avatar: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = file.ufsUrl ?? file.url;
      if (url) {
        await registerUserUploadClaim(metadata.userId, url, "avatar");
      }
      return { uploadedBy: metadata.userId, url };
    }),

  /** Studio / portal message replies — signed-in users only (no public contact form). */
  messageAttachment: f(messageAttachmentLimits)
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = file.ufsUrl ?? file.url;
      if (url) {
        await registerUserUploadClaim(
          metadata.userId,
          url,
          "message_attachment",
        );
      }
      return {
        uploadedBy: metadata.userId,
        url,
      };
    }),

  /** Studio project deliverables — team members assigned to the project. */
  projectDeliverable: f(messageAttachmentLimits)
    .input(z.object({ projectId: z.string().uuid() }))
    .middleware(async ({ input }) => {
      const session = await auth();
      if (!session?.user?.id || !isTeam(session.user.role)) {
        throw new UploadThingError("Unauthorized");
      }
      const allowed = await userHasStudioProjectAccess(
        session.user.id,
        session.user.role,
        input.projectId,
      );
      if (!allowed) {
        throw new UploadThingError("Forbidden");
      }
      return { userId: session.user.id, projectId: input.projectId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = file.ufsUrl ?? file.url;
      if (url) {
        await registerUserUploadClaim(
          metadata.userId,
          url,
          "project_deliverable",
        );
      }
      return {
        uploadedBy: metadata.userId,
        projectId: metadata.projectId,
        url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
