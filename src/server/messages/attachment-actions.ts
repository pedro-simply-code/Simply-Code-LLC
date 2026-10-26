"use server";

import { auth } from "~/lib/auth";
import {
  assertUserCanDiscardUpload,
  releaseUserUploadClaims,
} from "~/server/uploads/claims";
import { discardUploadThingImageUrl } from "~/server/uploadthing-storage";

export async function discardMessageAttachmentUrl(url: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  if (!(await assertUserCanDiscardUpload(session.user.id, url))) return;

  await discardUploadThingImageUrl(url, "message-attachment");
  await releaseUserUploadClaims(session.user.id, [url]);
}
