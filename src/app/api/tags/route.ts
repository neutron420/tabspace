import { route } from "@/src/server/api";
import { tags, writeTag } from "@/src/server/resources";

export const GET = route(tags);
export const POST = route(writeTag);
