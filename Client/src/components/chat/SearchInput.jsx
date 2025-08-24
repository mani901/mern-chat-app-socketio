import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const SearchInput = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <Input
        placeholder="Search chats..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 h-11 md:h-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-base md:text-sm"
      />
    </div>
  );
};

export default SearchInput;
