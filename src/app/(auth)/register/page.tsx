import { redirect } from "next/navigation";

/** Public registration is disabled; invited users accept their email link. */
export default function RegisterPage() {
  redirect("/login");
}
