import { Request, Response, NextFunction } from "express";

const SITE_PASSWORD = process.env.SITE_PASSWORD || "spellz";

export function sitePasswordMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path === "/site-login" || req.path.startsWith("/api/site-auth")) {
    return next();
  }

  if (req.session && (req.session as any).siteAuthenticated) {
    return next();
  }

  if (req.path.startsWith("/api")) {
    return res.status(401).json({ error: "Site access required" });
  }

  res.send(getLoginPage());
}

export function setupSiteAuth(app: any) {
  app.post("/api/site-auth/login", (req: Request, res: Response) => {
    const { password } = req.body;
    
    if (password === SITE_PASSWORD) {
      (req.session as any).siteAuthenticated = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });
}

function getLoginPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IMPULSIVE.CC - Access Required</title>
  <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #000;
      font-family: 'VT323', monospace;
      color: #0f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      padding: 2rem;
      border: 2px solid #0f0;
      background: rgba(0, 20, 0, 0.9);
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      text-shadow: 0 0 10px #0f0;
    }
    p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.8;
    }
    input {
      background: #000;
      border: 2px solid #0f0;
      color: #0f0;
      font-family: 'VT323', monospace;
      font-size: 1.5rem;
      padding: 0.75rem 1.5rem;
      text-align: center;
      width: 250px;
      margin-bottom: 1rem;
    }
    input:focus {
      outline: none;
      box-shadow: 0 0 10px #0f0;
    }
    button {
      background: transparent;
      border: 2px solid #0f0;
      color: #0f0;
      font-family: 'VT323', monospace;
      font-size: 1.5rem;
      padding: 0.75rem 2rem;
      cursor: pointer;
      transition: all 0.3s;
      touch-action: manipulation;
      -webkit-tap-highlight-color: rgba(0, 255, 0, 0.3);
      user-select: none;
      -webkit-user-select: none;
    }
    button:hover,
    button:active {
      background: #0f0;
      color: #000;
    }
    .error {
      color: #f00;
      margin-top: 1rem;
      display: none;
    }
    .scanlines {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.15),
        rgba(0, 0, 0, 0.15) 1px,
        transparent 1px,
        transparent 2px
      );
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div class="scanlines"></div>
  <div class="container">
    <h1>[ ACCESS REQUIRED ]</h1>
    <p>> Enter password to continue</p>
    <form id="login-form">
      <input type="password" id="password" placeholder="PASSWORD" autocomplete="off" autofocus>
      <br><br>
      <button type="submit">[ ENTER ]</button>
    </form>
    <p class="error" id="error">> ACCESS DENIED</p>
  </div>
  <script>
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('error');
      
      try {
        const res = await fetch('/api/site-auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
          credentials: 'include'
        });
        
        if (res.ok) {
          window.location.reload();
        } else {
          errorEl.style.display = 'block';
          document.getElementById('password').value = '';
        }
      } catch (err) {
        errorEl.style.display = 'block';
      }
    });
  </script>
</body>
</html>`;
}
