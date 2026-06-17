import { useQuery } from "@tanstack/react-query";
import { searchService } from "@/services/search.service";

export function useSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ["search", q],
    queryFn: () => searchService.query(q),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}
