import { Request, Response, Router } from "express";
import { readRoadtrip, writeRoadtrip } from "../utils/fileStorage.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import Roadtrip from "../model/roadtrip.model.js";
import randomizeOrder, { OrderedCountry } from "../utils/randomizer.js";

const router = Router();

// GET /roadtrip
router.get("/", authenticateToken, (_req: Request, res: Response) => {
  const roadtrip = readRoadtrip();
  const countries: OrderedCountry[] = randomizeOrder(roadtrip.countries);
  res.json({ countries });
});

// PUT /roadtrip
router.put("/", authenticateToken, (req: Request, res: Response) => {
  const { countries } = req.body as { countries: unknown };

  if (!Array.isArray(countries)) {
    return res.status(400).json({ message: "Invalid countries array." });
  }

  const roadtrip = new Roadtrip(countries as string[]);
  writeRoadtrip(roadtrip);
  res.status(200).json(roadtrip);
});

// GET /roadtrip/countries
router.get("/countries", authenticateToken, (_req: Request, res: Response) => {
  const roadtrip = readRoadtrip();
  res.json(randomizeOrder(roadtrip.countries));
});

// POST /roadtrip/countries
router.post("/countries", authenticateToken, (req: Request, res: Response) => {
  try {
    const { cca3 } = req.body as { cca3?: unknown };

    if (!cca3 || typeof cca3 !== "string") {
      return res.status(400).json({ message: "Invalid country cca3 id." });
    }

    const roadtrip = readRoadtrip();

    if (roadtrip.countries.includes(cca3)) {
      return res.status(409).json({ message: "Roadtrip already contains this country." });
    }

    roadtrip.countries.push(cca3);
    writeRoadtrip(roadtrip);

    res.status(201).send();
  } catch (error) {
    console.error("Error adding country to roadtrip:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /roadtrip/countries/:cca3
router.delete("/countries/:cca3", authenticateToken, (req: Request, res: Response) => {
  const { cca3 } = req.params;

  const roadtrip = readRoadtrip();
  const filteredCountries = roadtrip.countries.filter((id) => id !== cca3);

  if (filteredCountries.length === roadtrip.countries.length) {
    return res.status(404).json({ message: "Country not found." });
  }

  writeRoadtrip(new Roadtrip(filteredCountries));
  res.status(200).json(roadtrip);
});

export default router;
