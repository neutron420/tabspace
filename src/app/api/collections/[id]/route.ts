import { route } from "@/src/server/api";
import { writeCollection, deleteCollection } from "@/src/server/resources";

export const PATCH = route(writeCollection);
export const DELETE = route(deleteCollection);
