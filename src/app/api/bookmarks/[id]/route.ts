import { route } from "@/src/server/api";
import {
  readBookmark,
  writeBookmark,
  deleteBookmark,
} from "@/src/server/resources";

export const GET = route(readBookmark);
export const PATCH = route(writeBookmark);
export const DELETE = route(deleteBookmark);
