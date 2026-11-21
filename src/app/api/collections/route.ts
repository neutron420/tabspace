import { route } from "@/src/server/api";
import { collections, writeCollection } from "@/src/server/resources";

export const GET = route(collections);
export const POST = route(writeCollection);
