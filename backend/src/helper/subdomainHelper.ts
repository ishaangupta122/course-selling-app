import { Request, Response } from "express";

export const extractSubdomain = (req: Request) => {
  const headerSubdomain = req.get("X-Tenant-Subdomain")?.trim();
  if (headerSubdomain) {
    return headerSubdomain;
  }

  const candidates = [
    req.get("Referer"),
    req.get("Origin"),
    req.get("Host") ? `${req.protocol}://${req.get("Host")}` : null,
  ].filter(Boolean) as string[];

  for (const value of candidates) {
    try {
      const hostname = new URL(value).hostname;
      const subdomain = hostname.includes(".") ? hostname.split(".")[0] : null;

      if (subdomain && subdomain !== "www") {
        return subdomain;
      }
    } catch {
      continue;
    }
  }

  return null;
};
