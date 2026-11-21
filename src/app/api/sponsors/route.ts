import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export interface SponsorRecord {
  id: string;
  name: string;
  url: string;
  description: string;
  email: string;
  logo: string;
  bg?: string;
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), ".sponsors.json");

async function readSponsors(): Promise<SponsorRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveSponsors(sponsors: SponsorRecord[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(sponsors, null, 2), "utf-8");
}

export async function GET() {
  const sponsors = await readSponsors();
  return NextResponse.json({ sponsors });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brandName, productUrl, description, email, logoUrl, bg } = body;

    if (!brandName || !productUrl || !email) {
      return NextResponse.json(
        { error: "brandName, productUrl, and email are required" },
        { status: 400 }
      );
    }

    const sponsors = await readSponsors();
    const newSponsor: SponsorRecord = {
      id: `sp_${Date.now()}`,
      name: String(brandName).trim(),
      url: String(productUrl).trim(),
      description: String(description || "").trim(),
      email: String(email).trim().toLowerCase(),
      logo: String(logoUrl || `https://www.google.com/s2/favicons?domain=${productUrl}&sz=128`),
      bg: bg || "#ffffff",
      createdAt: new Date().toISOString(),
    };

    sponsors.push(newSponsor);
    await saveSponsors(sponsors);

    return NextResponse.json({ success: true, sponsor: newSponsor });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
