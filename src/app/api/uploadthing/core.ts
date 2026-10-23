import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { MESSAGE_ATTACHMENT_MAX_COUNT } from "~/lib/message-attachments";
import { auth } from "~/lib/auth";
import { isFounder } from "~/lib/roles";

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
      return { uploadedBy: metadata.userId, url: file.ufsUrl ?? file.url };
    }),

  /** Contact form (public) and studio message replies (founder). */
  messageAttachment: f(messageAttachmentLimits)
    .middleware(async () => {
      const session = await auth();
      const userId = session?.user?.id;
      if (userId && isFounder(session.user.role)) {
        return { userId, source: "studio" as const };
      }
      return { userId: userId ?? null, source: "contact" as const };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId ?? null,
        url: file.ufsUrl ?? file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
