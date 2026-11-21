import { route } from "@/src/server/api";
import { revokeCredential } from "@/src/server/extension-credentials";

export const DELETE = route(revokeCredential);
