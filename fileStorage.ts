import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import Roadtrip from "./model/roadtrip.model.js";

const dataFilePath = join(import.meta.dirname, "roadtrip.json");

export function readRoadtrip(): Roadtrip {
  try {
    const jsonData = readFileSync(dataFilePath, "utf8");
    const { countries } = JSON.parse(jsonData) as { countries: string[] };

    return new Roadtrip(countries);
  } catch (err) {
    console.error("Error reading data file:", err);
    return new Roadtrip([]);
  }
}

export function writeRoadtrip(data: Roadtrip): void {
  try {
    if (!(data instanceof Roadtrip)) {
      throw new Error("Data must be an instance of Roadtrip");
    }

    writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing to data file:", err);
  }
}