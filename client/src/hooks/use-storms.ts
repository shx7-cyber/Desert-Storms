import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// Types derived from the schema/api
export type StormResponse = z.infer<typeof api.storms.list.responses[200]>[number];

// Helper to get formatted base URL
function getBaseUrl(rawUrl: string) {
  const trimmedUrl = (rawUrl || "").trim();
  if (!trimmedUrl) return "";
  
  try {
    const urlObj = new URL(trimmedUrl.includes('://') ? trimmedUrl : `https://${trimmedUrl}`);
    let base = urlObj.origin;
    if (urlObj.pathname !== "/") {
      base += urlObj.pathname;
    }
    return base.endsWith('/') ? base.slice(0, -1) : base;
  } catch (e) {
    return trimmedUrl.endsWith('/') ? trimmedUrl.slice(0, -1) : trimmedUrl;
  }
}

// Hook to fetch all storms
export function useStorms() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  return useQuery({
    queryKey: [api.storms.list.path],
    queryFn: async () => {
      try {
        const baseUrl = getBaseUrl(backendUrl);
        const fetchUrl = baseUrl ? `${baseUrl}${api.storms.list.path}` : api.storms.list.path;
        
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        
        if (baseUrl) {
          data.forEach((storm: any) => {
            if (storm.mediaUrls) storm.mediaUrls = storm.mediaUrls.map((url: string) => url.startsWith('/') ? `${baseUrl}${url}` : url);
            if (storm.radarUrls) storm.radarUrls = storm.radarUrls.map((url: string) => url.startsWith('/') ? `${baseUrl}${url}` : url);
          });
        }
        
        return api.storms.list.responses[200].parse(data);
      } catch (e: any) {
        console.error("Storm fetch error:", e);
        if (window.location.hostname !== 'localhost' && !backendUrl) return [];
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
      const baseUrl = getBaseUrl(backendUrl);
      const fetchUrl = baseUrl ? `${baseUrl}${api.storms.create.path}` : api.storms.create.path;

      console.log("Submitting to:", fetchUrl);

      const res = await fetch(fetchUrl, {
        method: api.storms.create.method,
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Submission failed:", res.status, errorText);
        if (res.status === 401) throw new Error("Invalid owner code");
        try {
          const error = JSON.parse(errorText);
          throw new Error(error.message || "Validation failed");
        } catch (e) {
          throw new Error("Failed to log storm");
        }
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
      const baseUrl = getBaseUrl(backendUrl);
      const path = api.storms.delete.path.replace(":id", String(id));
      const fetchUrl = baseUrl ? `${baseUrl}${path}` : path;

      const res = await fetch(fetchUrl, {
        method: api.storms.delete.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid owner code");
        if (res.status === 404) throw new Error("Storm not found");
        throw new Error("Failed to delete storm log");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.storms.list.path] });
    },
  });
}
