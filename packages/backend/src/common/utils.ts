import { Error } from "../types/const";
import { bloomTable as BloomTable } from "@propelr/common";

import Koa from "koa";

export const invalidEmailBloomTable = new BloomTable(10000, 10);

export function sendErrorResponse(ctx: Koa.Context, err: Error) {
  ctx.body = JSON.stringify({
    error: {
      code: err.code, 
      message: err.message,
      details: err.details,
    },
    status: err.status,
  })
  ctx.set("Content-type", "application/json");
  ctx.status = err.status;
}

export function sendJSONResponse(ctx: Koa.Context, obj: any, status?: number) {
  let json = JSON.stringify(obj);

  ctx.body = json;
  ctx.set("Content-type", "application/json");
  ctx.status = status ?? 200;
}
