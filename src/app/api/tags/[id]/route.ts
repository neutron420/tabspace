import { route } from "@/src/server/api";
import { deleteTag } from "@/src/server/resources";

export const DELETE = route(deleteTag);
