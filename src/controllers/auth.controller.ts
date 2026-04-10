import { Request, Response, Router } from "express";
import webTokens from "jsonwebtoken";
import { authenticateToken } from "../middleware/auth.middleware.js";

const { sign } = webTokens;
const router = Router();

interface LoginBody {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  username: string;
}

router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body as LoginBody;

  if (username === process.env.LOGIN && password === process.env.PASSWORD) {
    const accessToken = sign({ username }, process.env.ACCESS_TOKEN_SECRET as string);
    res.json({ accessToken, username } satisfies LoginResponse);
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

router.post("/logout", authenticateToken, (_req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
