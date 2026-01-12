import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// Types derived from the schema/api
export type StormResponse = z.infer<typeof api.storms.list.responses[200]>[number];

// Hook to fetch all storms
export function useStorms() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  return useQuery({
    queryKey: [api.storms.list.path],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}${api.storms.list.path}`);
      if (!res.ok) throw new Error("Failed to fetch storms");
      const data = await res.json();
      
      // Map URLs to absolute if needed
      if (backendUrl) {
        data.forEach((storm: any) => {
          if (storm.mediaUrls) storm.mediaUrls = storm.mediaUrls.map((url: string) => url.startsWith('/') ? `${backendUrl}${url}` : url);
          if (storm.radarUrls) storm.radarUrls = storm.radarUrls.map((url: string) => url.startsWith('/') ? `${backendUrl}${url}` : url);
        });
      }
      
      return api.storms.list.responses[200].parse(data);
    },
  });
}

// Hook to create a storm (Multipart Form Data)
export function useCreateStorm() {
  const queryClient = useQueryClient();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(`${backendUrl}${api.storms.create.path}`, {
        method: api.storms.create.method,
        body: formData, // Browser sets Content-Type to multipart/form-data automatically
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid password");
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create storm log");
      }

      return api.storms.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.storms.list.path] });
    },
  });
}

// Hook to delete a storm
export function useDeleteStorm() {
  const queryClient = useQueryClient();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  return useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) => {
      const res = await fetch(`${backendUrl}${api.storms.delete.path.replace(":id", String(id))}`, {
        method: api.storms.delete.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid password");
        if (res.status === 404) throw new Error("Storm not found");
        throw new Error("Failed to delete storm log");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.storms.list.path] });
    },
  });
}
