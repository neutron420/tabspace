import { lookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";
import ipaddr from "ipaddr.js";
import { parse } from "node-html-parser";
import { invalid } from "./api";

export function bookmarkUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return invalid("Enter a valid HTTP or HTTPS URL.");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    invalid("Enter an HTTP or HTTPS URL without credentials.");
  const normalized = new URL(url);
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "fbclid",
    "gclid",
    "mc_eid",
    "ref",
    "ref_src",
    "_ga",
  ])
    normalized.searchParams.delete(key);
  normalized.searchParams.sort();
  normalized.pathname = normalized.pathname.replace(/\/+$/, "") || "/";
  return {
    url: url.href,
    normalizedUrl: normalized.href,
    domain: url.hostname.replace(/^www\./, ""),
  };
}

async function page(
  url: URL,
  signal: AbortSignal,
  redirects = 0,
): Promise<{ html: string; url: URL }> {
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && !["80", "443"].includes(url.port))
  )
    throw Error("Unsupported target");
  const addresses = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true });
  if (
    !addresses.length ||
    addresses.some(
      ({ address }) => ipaddr.process(address).range() !== "unicast",
    )
  )
    throw Error("Non-public address");
  const secure = url.protocol === "https:";
  const response = await new Promise<http.IncomingMessage>(
    (resolve, reject) => {
      // Connect to the validated address directly. Preserve the original HTTP host and TLS name.
      const req = (secure ? https : http).get(
        {
          hostname: addresses[0].address,
          port: url.port || (secure ? 443 : 80),
          path: url.pathname + url.search,
          servername: isIP(host) ? undefined : host,
          agent: false,
          signal,
          headers: {
            Host: url.host,
            Accept: "text/html",
            "Accept-Encoding": "identity",
          },
        },
        resolve,
      );
      req.on("socket", (socket) => {
        socket.setTimeout(3000, () => req.destroy(Error("Connection timeout")));
      });
      req.on("error", reject);
    },
  );
  try {
    if (
      [301, 302, 303, 307, 308].includes(response.statusCode ?? 0) &&
      response.headers.location &&
      redirects < 3
    ) {
      return page(
        new URL(response.headers.location, url),
        signal,
        redirects + 1,
      );
    }
    if (
      response.statusCode !== 200 ||
      !response.headers["content-type"]?.toLowerCase().includes("text/html") ||
      (response.headers["content-encoding"] ?? "identity") !== "identity"
    )
      throw Error("No HTML");
    const chunks: Buffer[] = [];
    let length = 0;
    for await (const chunk of response) {
      const bytes = Buffer.from(chunk);
      length += bytes.length;
      if (length > 2 * 1024 * 1024) throw Error("Page too large");
      chunks.push(bytes);
    }
    return { html: Buffer.concat(chunks).toString("utf8"), url };
  } finally {
    response.destroy();
  }
}
export async function metadata(value: string) {
  const normalized = bookmarkUrl(value);
  let title = normalized.domain;
  let description: string | null = null;
  let favicon = new URL("/favicon.ico", value).href;
  try {
    const signal = AbortSignal.timeout(5000);
    const result = await Promise.race([
      page(new URL(value), signal),
      new Promise<never>((_, reject) =>
        signal.addEventListener("abort", () => reject(Error("Timeout")), {
          once: true,
        }),
      ),
    ]);
    const html = parse(result.html);
    title = html.querySelector("title")?.text.trim().slice(0, 500) || title;
    description = html.querySelector('meta[name="description"]')?.getAttribute("content")?.trim().slice(0, 10000) || null;
    const icon = html
      .querySelectorAll("link")
      .find((link) =>
        link.getAttribute("rel")?.toLowerCase().split(/\s+/).includes("icon"),
      )
      ?.getAttribute("href");
    if (icon) {
      const target = new URL(icon, result.url);
      if (
        ["http:", "https:"].includes(target.protocol) &&
        !target.username &&
        !target.password
      )
        favicon = target.href;
    }
  } catch {
    /* Bookmarks remain usable when the destination has no accessible metadata. */
  }
  return { ...normalized, title, description, favicon };
}
