import { route } from "@/src/server/api";
import { createCredential, listCredentials } from "@/src/server/extension-credentials";

export const GET = route(listCredentials);
export const POST = route(createCredential);
