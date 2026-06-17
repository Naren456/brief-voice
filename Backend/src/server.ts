import { buildApp } from "./app";

async function start() {
  const app = await buildApp();
  try {
    const port = Number(process.env.PORT ?? 8000);

    await app.listen({
      port,
      host: "0.0.0.0",
    });

    console.log(`Server running on port ${port}`);
    console.log(`Swagger: http://localhost:${port}/docs`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
