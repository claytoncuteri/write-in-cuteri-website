// Admin landing. This is a server component  -  it checks the signed auth
// cookie on every request, so the "locked" screen cannot be bypassed by
// tampering with client state or inspecting the bundle. The dashboard itself
// is a client component mounted only when auth passes.

import { Lock } from "lucide-react";
import { isAdminAuthed } from "@/lib/admin-auth";
import { AdminLoginForm } from "./AdminLoginForm";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthed();

  if (!authed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-cream">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <Lock size={32} className="text-navy mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-charcoal font-serif">
              Campaign Admin
            </h1>
            <p className="text-sm text-charcoal/60 mt-1">
              Enter the admin password to continue
            </p>
          </div>
          <AdminLoginForm />
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
