import { route } from "@/src/server/api";
import { workspace } from "@/src/server/workspaces";

export const GET = route(workspace);
export const PATCH = route(workspace);
