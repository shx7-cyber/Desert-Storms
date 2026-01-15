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
      try {
        const trimmedUrl = backendUrl.trim();
        let baseUrl = "";
        if (trimmedUrl) {
          try {
            const urlObj = new URL(trimmedUrl);
            baseUrl = urlObj.origin;
            if (urlObj.pathname !== "/") {
               baseUrl += urlObj.pathname;
            }
            if (baseUrl.endsWith('/')) {
              baseUrl = baseUrl.slice(0, -1);
            }
          } catch (e) {
            baseUrl = trimmedUrl.endsWith('/') ? trimmedUrl.slice(0, -1) : trimmedUrl;
          }
        }
        
        let fetchUrl = api.storms.list.path;
        if (baseUrl) {
          const finalBase = (baseUrl.includes('://') || baseUrl.startsWith('localhost')) 
            ? baseUrl 
            : `https://${baseUrl}`;
          fetchUrl = `${finalBase}${api.storms.list.path}`;
        }
        
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        
        if (baseUrl) {
          const finalBase = (baseUrl.includes('://') || baseUrl.startsWith('localhost')) 
            ? baseUrl 
            : `https://${baseUrl}`;
          data.forEach((storm: any) => {
            if (storm.mediaUrls) storm.mediaUrls = storm.mediaUrls.map((url: string) => url.startsWith('/') ? `${finalBase}${url}` : url);
            if (storm.radarUrls) storm.radarUrls = storm.radarUrls.map((url: string) => url.startsWith('/') ? `${finalBase}${url}` : url);
          });
        }
        
        return api.storms.list.responses[200].parse(data);
      } catch (e: any) {
        console.error("Storm fetch error:", e);
        // Fallback for Netlify preview if backend is unreachable
        if (window.location.hostname !== 'localhost' && !backendUrl) {
          return [];
        }
        throw e;
      }
    },
  });
}

// Hook to create a storm (Multipart Form Data)
export function useCreateStorm() {
  const queryClient = useQueryClient();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const trimmedUrl = backendUrl.trim();
      let baseUrl = trimmedUrl.endsWith('/') ? trimmedUrl.slice(0, -1) : trimmedUrl;
      let fetchUrl = api.storms.create.path;
      if (baseUrl) {
        const finalBase = (baseUrl.includes('://') || baseUrl.startsWith('localhost')) 
          ? baseUrl 
          : `https://${baseUrl}`;
        fetchUrl = `${finalBase}${api.storms.create.path}`;
      }

      const res = await fetch(fetchUrl, {
        method: api.storms.create.method,
        body: formData, 
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
      const trimmedUrl = backendUrl.trim();
      let baseUrl = trimmedUrl.endsWith('/') ? trimmedUrl.slice(0, -1) : trimmedUrl;
      let fetchUrl = api.storms.delete.path.replace(":id", String(id));
      if (baseUrl) {
        const finalBase = (baseUrl.includes('://') || baseUrl.startsWith('localhost')) 
          ? baseUrl 
          : `https://${baseUrl}`;
        fetchUrl = `${finalBase}${fetchUrl}`;
      }

      const res = await fetch(fetchUrl, {
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
