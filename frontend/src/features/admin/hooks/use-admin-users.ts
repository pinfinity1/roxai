import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useImpersonateUser,
  useAdjustUserCredit,
  useListUsers,
} from "@/lib/api/admin-console/admin-console";

export function useAdminUsers() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // تاخیر ۵۰۰ میلی‌ثانیه برای جستجو
  const debouncedSearch = useDebounce(searchTerm, 500);

  // 1. Data Fetching (React Query)
  const {
    data: usersResponse, // 👈 الان این متغیر، خودِ دیتای نهایی است
    isLoading: isLoadingUsers,
    refetch,
    error, // 👈 ارور را هم اضافه کردیم برای هندل کردن ۴۰۱
  } = useListUsers({
    query: debouncedSearch,
    page: page,
    page_size: 10,
  });

  // ❌ غلط (قدیمی): const users = usersResponse?.data.items || [];
  // ✅ درست (جدید): .data حذف شد
  const users = usersResponse?.items || [];
  const totalPages = usersResponse?.total_pages || 1;

  // 2. Mutations
  const { mutate: impersonate, isPending: isImpersonating } =
    useImpersonateUser();
  const { mutate: adjustCredit, isPending: isAdjusting } =
    useAdjustUserCredit();

  // 3. Handlers
  const handleImpersonate = (userId: string) => {
    impersonate(
      { data: { target_user_id: userId, reason: "Admin Panel Access" } },
      {
        onSuccess: (response) => {
          // ❌ غلط: router.push(response.data.redirect_url);
          // ✅ درست:
          router.push(response.redirect_url);
        },
        onError: () => alert("خطا در جعل هویت. دسترسی غیرمجاز."),
      },
    );
  };

  const handleCreditAdjustment = (userId: string) => {
    const amountStr = prompt("مبلغ تغییر اعتبار (تومان) - منفی برای کسر:");
    if (!amountStr) return;

    const amount = parseInt(amountStr);
    if (isNaN(amount)) return alert("مبلغ نامعتبر است");

    const reason = prompt("دلیل تغییر (اجباری برای Audit Log):");
    if (!reason || reason.length < 5)
      return alert("دلیل باید حداقل ۵ کاراکتر باشد");

    adjustCredit(
      {
        data: {
          target_user_id: userId,
          amount: amount,
          reason_note: reason,
        },
      },
      {
        onSuccess: (res) => {
          // ❌ غلط: const newBalance = res.data.new_balance ...
          // ✅ درست: (چون ریسپانس این اندپوینت unknown یا dict است، مستقیم فیلد را می‌خوانیم)
          // @ts-ignore
          const newBalance = res?.new_balance || "Updated";

          alert(`✅ موجودی جدید: ${newBalance}`);
          refetch();
        },
        onError: () => alert("❌ خطا در تغییر اعتبار"),
      },
    );
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1); // Reset page on search
  };

  return {
    users,
    totalPages,
    page,
    setPage,
    searchTerm,
    handleSearchChange,
    isLoadingUsers,
    isImpersonating,
    isAdjusting,
    handleImpersonate,
    handleCreditAdjustment,
    error, // ارور را هم برگرداندیم
  };
}
