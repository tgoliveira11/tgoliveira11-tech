import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { tags } from "./tags.schema";

export type Tag = InferSelectModel<typeof tags>;
export type NewTag = InferInsertModel<typeof tags>;
