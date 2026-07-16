import { Request, Response, Router } from "express";
import { readFile } from "fs/promises";
import { join } from "path";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { Country } from "../model/country.model.js";

const router = Router();

interface PaginatedResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: T[];
}

const countriesFilePath = join(import.meta.dirname, "../../data/countries.json");

let countriesCache: Country[] | null = null;

// Load the local country list once and cache it for subsequent requests.
async function loadCountries(): Promise<Country[]> {
  if (!countriesCache) {
    const raw = await readFile(countriesFilePath, "utf8");
    countriesCache = JSON.parse(raw) as Country[];
  }
  return countriesCache;
}

function parsePagination(
  rawPage: string | undefined,
  rawPageSize: string | undefined
): { page: number; pageSize: number } {
  return {
    page: parseInt(rawPage ?? ""),
    pageSize: parseInt(rawPageSize ?? ""),
  };
}

// True when exactly one of page/pageSize is provided (invalid combination).
function hasPartialPagination(page: number, pageSize: number): boolean {
  return (!!page && !pageSize) || (!page && !!pageSize);
}

function buildPaginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const startIndex = (page - 1) * pageSize;
  return {
    total: data.length,
    page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize),
    data: data.slice(startIndex, startIndex + pageSize),
  };
}

// Case-insensitive partial match on common/official names only.
function matchesName(country: Country, query: string): boolean {
  const needle = query.toLowerCase();
  const common = country.name?.common?.toLowerCase() ?? "";
  const official = country.name?.official?.toLowerCase() ?? "";
  return common.includes(needle) || official.includes(needle);
}

// GET /countries
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const data = await loadCountries();

    const { page, pageSize } = parsePagination(
      req.query.page as string,
      req.query.pageSize as string
    );

    if (hasPartialPagination(page, pageSize)) {
      return res.status(400).json({
        message: "Invalid pagination parameters. Provide both page and pageSize or none.",
      });
    }

    if (!isNaN(page) && !isNaN(pageSize) && page > 0 && pageSize > 0) {
      return res.json(buildPaginatedResponse(data, page, pageSize));
    }

    res.json(data);
  } catch {
    res.status(500).json({ message: "Failed to fetch countries" });
  }
});

// GET /countries/name/:name
router.get("/name/:name", authenticateToken, async (req: Request, res: Response) => {
  const name = String(req.params.name);

  const { page, pageSize } = parsePagination(
    req.query.page as string,
    req.query.pageSize as string
  );

  // Pagination is mandatory on this route: both params must be valid numbers.
  if (hasPartialPagination(page, pageSize) || isNaN(page) || isNaN(pageSize)) {
    return res.status(400).json({
      message: "Invalid pagination parameters. Provide both page and pageSize or none.",
    });
  }

  try {
    const data = (await loadCountries()).filter((country) => matchesName(country, name));

    if (!data.length) {
      return res.status(404).json({ message: "Country not found" });
    }

    return res.json(buildPaginatedResponse(data, page, pageSize));
  } catch {
    res.status(500).json({ message: "Failed to fetch country by name" });
  }
});

// GET /countries/codes?codes=FRA,ESP
router.get("/codes", authenticateToken, async (req: Request, res: Response) => {
  const codes = req.query.codes as string | undefined;

  if (!codes) {
    return res.status(400).json({ message: "Missing 'codes' query parameter" });
  }

  const codeList = codes.split(",");

  if (!codeList.length || !codeList.every((c) => c.length === 3)) {
    return res.status(400).json({
      message: "Invalid 'codes' query parameter. Must be comma-separated 3-letter uppercase codes.",
    });
  }

  try {
    const data = await loadCountries();
    // Preserve the order requested by the client; unknown codes are dropped.
    const sorted = codeList
      .map((code) => data.find((c) => c.cca3.toUpperCase() === code.toUpperCase()))
      .filter((c): c is Country => Boolean(c));

    if (!sorted.length) {
      return res.status(404).json({ message: "Countries not found for provided codes" });
    }

    res.json(sorted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch countries by codes" });
  }
});

// GET /countries/codes/:code
router.get("/codes/:code", authenticateToken, async (req: Request, res: Response) => {
  const code = String(req.params.code);

  if (code.length !== 3) {
    return res.status(400).json({ message: "Invalid code parameter" });
  }

  try {
    const country = (await loadCountries()).find(
      (c) => c.cca3 === code.toUpperCase()
    );

    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }

    res.json(country);
  } catch {
    res.status(500).json({ message: "Failed to fetch country by code" });
  }
});

export default router;
