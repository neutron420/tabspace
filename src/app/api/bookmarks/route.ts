import { route } from "@/src/server/api";
import { list, writeBookmark } from "@/src/server/resources";

export const GET = route(list("Bookmark"));
export const POST = route(writeBookmark);
