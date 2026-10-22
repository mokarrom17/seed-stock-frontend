import { useQuery } from "@tanstack/react-query";
import seedTypeService from "../services/seedTypeService";

export function useSeedTypes(seasonId) {
  return useQuery({
    queryKey: ["seed-stock", "seedTypes", seasonId ?? "all"],
    queryFn: () => seedTypeService.getBySeason(seasonId),
  });
}

export function useSeedQualities(seedTypeId) {
  return useQuery({
    queryKey: ["seed-stock", "seedQualities", seedTypeId],
    queryFn: () => seedTypeService.getQualities(seedTypeId),
    enabled: Boolean(seedTypeId),
  });
}
