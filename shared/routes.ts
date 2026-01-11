import { z } from "zod";
import { insertStormSchema, storms } from "./schema";

export const errorSchemas = {
  unauthorized: z.object({ message: z.string() }),
  validation: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  storms: {
    list: {
      method: "GET" as const,
      path: "/api/storms",
      responses: {
        200: z.array(z.custom<typeof storms.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/storms",
      // Input is multipart/form-data, so we don't strictly validate body shape here in Zod for the router, 
      // but the handler will validate.
      responses: {
        201: z.custom<typeof storms.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/storms/:id",
      input: z.object({ password: z.string() }), // Passed in body
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
};
