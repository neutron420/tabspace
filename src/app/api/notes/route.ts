import { route } from "@/src/server/api";
import { list, writeNote } from "@/src/server/resources";

export const GET = route(list("Note"));
export const POST = route(writeNote);
