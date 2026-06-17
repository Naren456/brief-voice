import { buildApp } from "../src/app";
import { FastifyInstance } from "fastify";

let appInstance: FastifyInstance | null = null;

export default async function (req: any, res: any) {
  if (!appInstance) {
    appInstance = await buildApp();
    await appInstance.ready();
  }
  
  appInstance.server.emit("request", req, res);
}
