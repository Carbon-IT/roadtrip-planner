class Roadtrip {
  countries: string[];

  constructor(countries: string[]) {
    if (!Array.isArray(countries)) {
      throw new TypeError("Countries must be an array");
    }
    this.countries = countries;
  }

  addCountry(country: string): void {
    if (!this.countries.includes(country)) {
      this.countries.push(country);
    }
  }

  removeCountry(country: string): void {
    this.countries = this.countries.filter((c) => c !== country);
  }

  getCountries(): string[] {
    return this.countries;
  }

  clearCountries(): void {
    this.countries = [];
  }
}

export default Roadtrip;