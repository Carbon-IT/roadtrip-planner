import { Request, Response, Router } from "express";
import { readFile } from "fs/promises";
import { join } from "path";
import { countryFields } from "../constants.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

interface PaginatedResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: T[];
}

interface CountryByCode {
  cca3: string;
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

// GET /countries
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const raw = await readFile(
      join(import.meta.dirname, "../../data/countries.json"),
      "utf8"
    );
    const data = JSON.parse(raw) as unknown[];

    const { page, pageSize } = parsePagination(
      req.query.page as string,
      req.query.pageSize as string
    );

    if ((page && !pageSize) || (!page && pageSize)) {
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
  const { name } = req.params;

  const { page, pageSize } = parsePagination(
    req.query.page as string,
    req.query.pageSize as string
  );

  if ((page && !pageSize) || (!page && pageSize) || isNaN(page) || isNaN(pageSize)) {
    return res.status(400).json({
      message: "Invalid pagination parameters. Provide both page and pageSize or none.",
    });
  }

  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(String(name))}?fields=${countryFields.join(",")}`
    );

    if (response.status === 404) {
      return res.status(404).json({ message: "Country not found" });
    }

    const data = (await response.json()) as unknown[];

    if (page > 0 && pageSize > 0) {
      return res.json(buildPaginatedResponse(data, page, pageSize));
    }

    res.json(data);
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
    const response = await fetch(
      `https://restcountries.com/v3.1/alpha?codes=${codeList.join(",")}&fields=${countryFields.join(",")}`
    );

    if (response.status === 404) {
      return res.status(404).json({ message: "Countries not found for provided codes" });
    }

    const data = (await response.json()) as CountryByCode[];
    const sorted = codeList.map((code) => data.find((c) => c.cca3 === code));

    res.json(sorted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch countries by codes" });
  }
});

// GET /countries/codes/:code
router.get("/codes/:code", authenticateToken, async (req: Request, res: Response) => {
  const { code } = req.params;

  if (code.length !== 3) {
    return res.status(400).json({ message: "Invalid code parameter" });
  }

  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/alpha/${encodeURIComponent(String(code))}?fields=${countryFields.join(",")}`
    );

    if (response.status === 404) {
      return res.status(404).json({ message: "Country not found" });
    }

    res.json(await response.json());
  } catch {
    res.status(500).json({ message: "Failed to fetch country by code" });
  }
});

export default router;
