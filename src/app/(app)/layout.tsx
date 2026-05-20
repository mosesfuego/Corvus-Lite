import { AppShell } from "@/components/app-shell/app-shell";
import { ProtectedRoute } from "@/components/app-shell/protected-route";
import { CompanyContextProvider } from "@/context/CompanyContext";

export default function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <CompanyContextProvider>
        <AppShell>{children}</AppShell>
      </CompanyContextProvider>
    </ProtectedRoute>
  );
}
