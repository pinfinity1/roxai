import { Wallet, Ghost, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminUserListItem } from "@/lib/api/model"; // Orval generated type

interface UserTableProps {
  users: AdminUserListItem[];
  isLoading: boolean;
  isActionLoading: boolean;
  onImpersonate: (id: string) => void;
  onCreditAdjust: (id: string) => void;
}

export function UserTable({
  users,
  isLoading,
  isActionLoading,
  onImpersonate,
  onCreditAdjust,
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className="p-16 text-center text-gray-400">
        در حال دریافت اطلاعات...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-16 text-center text-gray-400 flex flex-col items-center gap-2">
        <Ghost className="w-8 h-8 opacity-20" />
        <p>کاربری با این مشخصات پیدا نشد.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-right">
        <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
          <tr>
            <th className="px-6 py-4">کاربر</th>
            <th className="px-6 py-4">وضعیت / نقش</th>
            <th className="px-6 py-4">اعتبار (تومان)</th>
            <th className="px-6 py-4 text-center">عملیات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-gray-50/80 transition-colors group"
            >
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800">
                    {user.email || user.mobile || "بدون شناسه"}
                  </span>
                  <div className="flex gap-2 text-[10px] text-gray-400 font-mono mt-0.5">
                    <span>
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="opacity-50">|</span>
                    <span>{user.id}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <Badge
                    variant={
                      ["admin", "support"].includes(user.role)
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {user.role.toUpperCase()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      user.is_active
                        ? "text-green-600 bg-green-50"
                        : "text-red-600 bg-red-50"
                    }
                  >
                    {user.is_active ? "Active" : "Banned"}
                  </Badge>
                </div>
              </td>
              <td className="px-6 py-4 font-mono text-gray-700 font-bold">
                {user.credit?.toLocaleString() || "0"}
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center gap-3 opacity-80 group-hover:opacity-100 transition-all">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCreditAdjust(user.id)}
                    disabled={isActionLoading}
                    className="h-9 gap-2 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Wallet className="w-4 h-4" /> تراکنش
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onImpersonate(user.id)}
                    disabled={isActionLoading}
                    className="h-9 gap-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"
                  >
                    {isActionLoading ? (
                      <CheckCircle className="animate-ping w-4 h-4" />
                    ) : (
                      <Ghost className="w-4 h-4" />
                    )}
                    جعل هویت
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
