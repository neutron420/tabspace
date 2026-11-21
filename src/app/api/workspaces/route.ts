import { route } from "@/src/server/api";
import { listWorkspaces, newWorkspace } from "@/src/server/workspaces";

export const GET = route(listWorkspaces);
export const POST = route(newWorkspace);
