import { route } from "@/src/server/api";
import { list } from "@/src/server/resources";

export const GET = route(list("Activity"));
