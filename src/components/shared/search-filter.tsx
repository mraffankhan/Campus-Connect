"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransition } from "react";

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterProps {
  placeholder?: string;
  filterParamName?: string;
  filterLabel?: string;
  filterOptions?: FilterOption[];
}

export function SearchFilter({
  placeholder = "Search...",
  filterParamName,
  filterLabel = "All Categories",
  filterOptions = [],
}: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const searchQuery = searchParams?.get("q") ?? "";
  const selectedFilter = filterParamName ? searchParams?.get(filterParamName) ?? "ALL" : null;

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    // Always reset page to 1 when changing search or filter
    params.delete("page");

    Object.entries(updates).forEach(([key, val]) => {
      if (!val || val === "ALL") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          defaultValue={searchQuery}
          onChange={(e) => updateQueryParams({ q: e.target.value.trim() ? e.target.value : null })}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => updateQueryParams({ q: null })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filterParamName && filterOptions.length > 0 && (
        <Select
          value={selectedFilter ?? "ALL"}
          onValueChange={(val) => updateQueryParams({ [filterParamName]: val })}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={filterLabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{filterLabel}</SelectItem>
            {filterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
