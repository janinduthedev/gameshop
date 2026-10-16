"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRODUCT_SORT_OPTIONS } from "@/constants";
import type { CategoryDTO } from "@/lib/queries";

export function ProductFilters({ categories }: { categories: CategoryDTO[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  return (
    <form
      className="flex flex-col gap-3 md:flex-row md:items-center"
      onSubmit={(event) => {
        event.preventDefault();
        updateParam("search", search);
      }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
      </div>

      <select
        aria-label="Category"
        defaultValue={searchParams.get("category") ?? ""}
        onChange={(event) => updateParam("category", event.target.value)}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Sort by"
        defaultValue={searchParams.get("sort") ?? "newest"}
        onChange={(event) => updateParam("sort", event.target.value)}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      >
        {PRODUCT_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <Button type="submit" className="md:w-28">
        Search
      </Button>
    </form>
  );
}
