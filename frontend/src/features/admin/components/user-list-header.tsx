import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface UserListHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
}

export function UserListHeader({
  searchTerm,
  onSearchChange,
  isLoading,
}: UserListHeaderProps) {
  return (
    <Card className="border-0 shadow-lg ring-1 ring-gray-100 bg-white">
      <div className="p-4 flex gap-4 items-center">
        <Search className="w-5 h-5 text-gray-400" />
        <Input
          placeholder="جستجو با ایمیل، موبایل، نام یا شناسه..."
          className="border-0 shadow-none text-lg focus-visible:ring-0 bg-transparent placeholder:text-gray-300"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {isLoading && (
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        )}
      </div>
    </Card>
  );
}
