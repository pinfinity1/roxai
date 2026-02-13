import { MobileHeader } from "@/components/global/mobile-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { WorkspaceContextSidebar } from "@/features/workspace/sidebar/context-sidebar";
import { WorkspaceSidebar } from "@/features/workspace/sidebar/main-sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "72px",
          "--sidebar-width-icon": "72px",
        } as React.CSSProperties
      }
    >
      <WorkspaceSidebar />

      <WorkspaceContextSidebar />

      <SidebarInset>
        <MobileHeader />

        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
