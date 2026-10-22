import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import createResourceService from "../mockApi/services/resourceService";

export function useResource(resourceName, options = {}) {
  const service = createResourceService(`/${resourceName}`);
  const queryKey = ["seed-stock", resourceName];

  return useQuery({
    queryKey,
    queryFn: () => service.getAll(),
    ...options,
  });
}

export function useCreateResource(resourceName) {
  const queryClient = useQueryClient();
  const service = createResourceService(`/${resourceName}`);

  return useMutation({
    mutationFn: (data) => service.create(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["seed-stock"],
      });
    },
  });
}

export function useUpdateResource(resourceName) {
  const queryClient = useQueryClient();
  const service = createResourceService(`/${resourceName}`);

  return useMutation({
    mutationFn: ({ id, data }) => service.update(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["seed-stock"],
      });
    },
  });
}

export function useDeleteResource(resourceName) {
  const queryClient = useQueryClient();
  const service = createResourceService(`/${resourceName}`);

  return useMutation({
    mutationFn: (id) => service.remove(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["seed-stock"],
      });
    },
  });
}
