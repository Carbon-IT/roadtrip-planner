interface LocalizedName {
  official: string;
  common: string;
}

interface Name {
  common: string;
  official: string;
  nativeName: Record<string, LocalizedName>;
}

interface Currency {
  name: string;
  symbol: string;
}

interface CapitalInfo {
  latlng: [number, number];
}

interface Flags {
  svg: string;
  png: string;
  alt: string;
}

interface CoatOfArms {
  svg: string;
  png: string;
}

interface Maps {
  googleMaps: string;
  openStreetMaps: string;
}

interface PostalCode {
  format: string | null;
  regex: string | null;
}

export interface Country {
  name: Name;
  cca3: string;
  independent: boolean;
  status: string;
  unMember: boolean;
  currencies: Record<string, Currency>;
  capital: string[];
  capitalInfo: CapitalInfo;
  region: string;
  subregion: string;
  continents: string[];
  languages: Record<string, string>;
  translations: Record<string, LocalizedName>;
  latlng: [number, number];
  landlocked: boolean;
  borders: string[];
  area: number;
  flag: string;
  flags: Flags;
  coatOfArms: CoatOfArms;
  population: number;
  maps: Maps;
  postalCode: PostalCode;
  startOfWeek: string;
  timezones: string[];
}
