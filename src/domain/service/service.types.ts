import { z } from "zod";
import { ServiceSchema } from "./service.schema";

export type Service = z.infer<typeof ServiceSchema>;
