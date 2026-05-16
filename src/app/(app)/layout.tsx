import { AppShell } from "@/components/app-shell/app-shell";
import { ProtectedRoute } from "@/components/app-shell/protected-route";

export default function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
