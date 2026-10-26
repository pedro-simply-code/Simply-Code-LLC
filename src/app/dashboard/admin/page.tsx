import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function AdminPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin area</CardTitle>
        <CardDescription>
          Only users with the `admin` role can view this route (middleware +
          layout).
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        Promote a user in the database:{" "}
        <code className="bg-muted rounded px-1.5 py-0.5">
          UPDATE simplycode_users SET role = &apos;admin&apos; …
        </code>
      </CardContent>
    </Card>
  );
}
