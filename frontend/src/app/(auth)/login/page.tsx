// frontend/src/app/login/page.tsx
import { AuthWizard } from "@/features/auth/components/auth-wizard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roxai",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#F3F4F6] font-vazir">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[10%] -right-[5%] h-[600px] w-[600px] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute top-[30%] left-[10%] h-[400px] w-[400px] rounded-full bg-teal-500/5 blur-[100px]" />
        <div className="absolute -bottom-[10%] right-[20%] h-[500px] w-[500px] rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>

      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-[420px] p-4">
        <AuthWizard />
      </div>
    </div>
  );
}
