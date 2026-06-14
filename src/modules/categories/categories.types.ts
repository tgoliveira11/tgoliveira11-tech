import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { categories } from "./categories.schema";

export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;
