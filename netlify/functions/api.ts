import serverless from "serverless-http";
import { createServer } from "../../backend";

export const handler = serverless(createServer());
