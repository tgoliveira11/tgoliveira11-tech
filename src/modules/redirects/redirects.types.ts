import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { redirects } from "./redirects.schema";

export type Redirect = InferSelectModel<typeof redirects>;
export type NewRedirect = InferInsertModel<typeof redirects>;
