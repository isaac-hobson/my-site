import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import { setupAuth } from "./auth.js";
import { setupRoutes } from "./routes.js";
import { sitePasswordMiddleware, setupSiteAuth } from "./middleware/siteAuth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'", "blob:", "data:"],
    },
  },
}));

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

setupAuth(app);
setupSiteAuth(app);
app.use(sitePasswordMiddleware);
setupRoutes(app);

const publicPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, "..", "public")
  : path.join(__dirname, "..", "public");

app.use(express.static(publicPath, {
  setHeaders: (res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  },
}));

app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(publicPath, "index.html"));
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Impulsive.cc Professional Platform running on port ${PORT}`);
});
