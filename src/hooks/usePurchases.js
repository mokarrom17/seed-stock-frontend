import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseService } from "../services";

const purchaseKeys = {
  all: ["seed-stock", "purchases"],
  lists: () => ["seed-stock", "purchases"],
  list: (filters = {}) => ["seed-stock", "purchases", filters],
  detail: (id) => ["seed-stock", "purchases", "detail", id],
};

export function usePurchases(filters = {}) {
  return useQuery({
    queryKey: purchaseKeys.list(filters),
    queryFn: () => purchaseService.getAll(filters),
  });
}

export function usePurchase(purchaseId) {
  return useQuery({
    queryKey: purchaseKeys.detail(purchaseId),
    queryFn: () => purchaseService.getById(purchaseId),
    enabled: Boolean(purchaseId),
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchaseData) => purchaseService.createPurchase(purchaseData),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: purchaseKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey: ["seed-stock", "supplierPayments"],
      });
    },
  });
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => purchaseService.update(id, data),

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: purchaseKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey: purchaseKeys.detail(variables.id),
      });
    },
  });
}

export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchaseId) => purchaseService.remove(purchaseId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: purchaseKeys.all,
      });
    },
  });
}
