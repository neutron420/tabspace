export interface SponsorItem {
  id?: string;
  name: string;
  url: string;
  logo: string;
  sublabel?: string;
  bg?: string;
  border?: string;
}

export interface SponsorApp {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  url: string;
  logo: string;
  bg?: string;
  border?: string;
  isOpenSlot?: boolean;
  price?: string;
}

export const GITHUB_SPONSORS_URL = "https://github.com/neutron420/tabspace";

// Empty by default: only real paid sponsors will appear
export const INITIAL_SPONSORS: SponsorItem[] = [];
