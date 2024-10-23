import type { StatusCode } from "hono/utils/http-status";

export interface IRepository<Model> {
    data: Model | null;
    error: any;
}

export interface IService<Model> {
    response: IRepository<Model>;
    code: StatusCode;
}