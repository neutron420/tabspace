import { route } from "@/src/server/api";
import { profile } from "@/src/server/workspaces";

export const POST = route(profile, true);
