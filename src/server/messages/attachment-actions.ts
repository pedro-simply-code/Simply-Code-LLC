"use server";

import { discardUploadThingImageUrl } from "~/server/uploadthing-storage";

export async function discardMessageAttachmentUrl(url: string) {
  await discardUploadThingImageUrl(url, "message-attachment");
}
