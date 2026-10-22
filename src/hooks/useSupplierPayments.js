import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierPaymentService } from "../services";

const supplierPaymentKeys = {
  all: ["seed-stock", "supplierPayments"],

  list: (filters = {}) => ["seed-stock", "supplierPayments", filters],

  detail: (id) => ["seed-stock", "supplierPayments", "detail", id],
};

// Get all supplier payments or filter by purchase/supplier
export function useSupplierPayments(filters = {}) {
  return useQuery({
    queryKey: supplierPaymentKeys.list(filters),
    queryFn: () => supplierPaymentService.getAll(filters),
  });
}

// Get a single payment
export function useSupplierPayment(paymentId) {
  return useQuery({
    queryKey: supplierPaymentKeys.detail(paymentId),
    queryFn: () => supplierPaymentService.getById(paymentId),
    enabled: Boolean(paymentId),
  });
}

// Create a supplier payment
export function useCreateSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentData) =>
      supplierPaymentService.createPayment(paymentData),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: supplierPaymentKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: ["seed-stock", "purchases"],
        }),
      ]);
    },
  });
}

// Update an existing payment
export function useUpdateSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => supplierPaymentService.update(id, data),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: supplierPaymentKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: ["seed-stock", "purchases"],
        }),

        queryClient.invalidateQueries({
          queryKey: supplierPaymentKeys.detail(variables.id),
        }),
      ]);
    },
  });
}

// Delete a payment
export function useDeleteSupplierPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId) => supplierPaymentService.remove(paymentId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: supplierPaymentKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: ["seed-stock", "purchases"],
        }),
      ]);
    },
  });
}
