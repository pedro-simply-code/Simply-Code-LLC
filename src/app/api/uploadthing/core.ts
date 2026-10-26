import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { MESSAGE_ATTACHMENT_MAX_COUNT } from "~/lib/message-attachments";
import { auth } from "~/lib/auth";
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
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl ?? file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
