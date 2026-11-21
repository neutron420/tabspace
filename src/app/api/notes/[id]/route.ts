import { route } from "@/src/server/api";
import { writeNote, deleteNote } from "@/src/server/resources";

export const PATCH = route(writeNote);
export const DELETE = route(deleteNote);
