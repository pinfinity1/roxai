import { Metadata } from "next";
import { AdminUsersView } from "@/features/admin/components/admin-users-view";

export const metadata: Metadata = {
  title: "Admin Console | Roxai",
  description: "Internal operations dashboard",
};

export default function AdminPage() {
  return <AdminUsersView />;
}
