import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import meetingRoutes from "./routes/meetings";
import searchRoutes from "./routes/search";
import analyticsRoutes from "./routes/analytics";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  // Use Zod for request validation and response serialization across all routes.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  // Restrict cross-origin access to local dev and the deployed frontend.
  // Additional origins can be supplied via CORS_ORIGINS (comma-separated).
  const allowedOrigins = [
    "https://brief-voice-g8nx.vercel.app",
    ...(process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? []),
  ];
  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow non-browser requests (curl, server-to-server) that send no Origin.
      if (!origin) return cb(null, true);
      // Allow any localhost / 127.0.0.1 port during development.
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isLocalhost || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin not allowed by CORS: ${origin}`), false);
    },
    // @fastify/cors defaults to GET,HEAD,POST only — list every method the API uses.
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(multipart, {
    limits: {
      fieldNameSize: 100,        // Max field name size in bytes
      fieldSize: 100,            // Max field value size in bytes
      fields: 10,                 // Max number of non-file fields
      fileSize: 500 * 1024 * 1024, // 500 MB limit (adjust this to your needs)
      files: 1,                  // Allow only 1 file per upload request
    }
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "BriefVoice API",
        description: "AI Meeting Intelligence Platform",
        version: "1.0.0",
      },
    },
    // Convert Zod route schemas into OpenAPI definitions for Swagger UI.
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs",
  });

  await app.register(meetingRoutes);
  await app.register(searchRoutes);
  await app.register(analyticsRoutes);

  app.get("/", async () => {
    return {
      status: "running",
      service: "BriefVoice",
    };
  });

  return app;
}
