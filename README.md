# My Dashboard App

A complete, production-ready **full-stack authentication & dashboard** application built with the MERN stack.

- **Frontend:** React + Vite + Tailwind CSS + React Router + Axios + Lucide icons  
- **Backend:** Node.js + Express + MongoDB Atlas + Mongoose + JWT (httpOnly cookies) + bcryptjs  
- **Architecture:** Single Express server serves both the API and the React production build from `web/build`

---

## Features

- Secure signup & login with validation, password strength indicator, show/hide password
- Passwords hashed with bcrypt (never stored in plain text)
- JWT authentication via httpOnly cookies
- Protected routes (frontend + backend)
- User dashboard with real MongoDB data
- Editable profile (name + optional avatar URL)
- Change password with current-password verification
- Rate limiting on auth endpoints
- Helmet security headers
- Responsive premium SaaS-style UI
- SPA fallback so React Router works after page refresh
- Health check endpoint

---

## Project Structure

```
my-dashboard-app/
├── web/                    # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── context/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js      # build.outDir = "build"
├── config/
│   └── db.js
├── models/
│   └── User.js
├── controllers/
│   ├── authController.js
│   └── userController.js
├── routes/
│   ├── authRoutes.js
│   └── userRoutes.js
├── middleware/
│   └── authMiddleware.js
├── server.js               # Express entry – serves API + frontend
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

There is **no separate `backend/` folder**. All Express files live in the project root. The React app lives entirely inside `web/`.

---

## Prerequisites

1. **Node.js 18+**  
   Download from https://nodejs.org and install.

2. **MongoDB Atlas account** (free tier is fine)  
   - Go to https://cloud.mongodb.com and create a cluster.  
   - Create a database user (username + password).  
   - Under Network Access, allow access from your IP (or `0.0.0.0/0` for development).  
   - Click **Connect → Connect your application** and copy the connection string.

3. **VS Code** (recommended) – open the project folder after cloning/extracting.

---

## Local Setup (Windows / macOS / Linux)

### 1. Open the project

```bash
cd path\to\my-dashboard-app
```

Or open the folder in VS Code: **File → Open Folder**.

### 2. Install root dependencies

```bash
npm install
```

### 3. Install frontend dependencies

```bash
npm --prefix web install
```

### 4. Create environment file

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

### 5. Edit `.env`

Open `.env` and fill in real values:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/my-dashboard-app?retryWrites=true&w=majority

JWT_SECRET=replace_this_with_a_long_random_string_at_least_32_chars

CLIENT_URL=http://localhost:5173
```

**How to generate a JWT secret:**

```bash
# PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])

# or Node
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 6. Run in development mode

```bash
npm run dev
```

This starts:

- Express API on **http://localhost:5000**
- Vite frontend on **http://localhost:5173** (proxies `/api` → Express)

Open **http://localhost:5173** in your browser.

### 7. Production build & run (single server)

```bash
npm run build
npm start
```

Express now serves both the API and the React app from `web/build` on **http://localhost:5000**.

---

## API Endpoints

| Method | Endpoint                    | Access   | Description                |
|--------|-----------------------------|----------|----------------------------|
| POST   | `/api/auth/signup`          | Public   | Register new user          |
| POST   | `/api/auth/login`           | Public   | Login                      |
| POST   | `/api/auth/logout`          | Private  | Logout (clear cookie)      |
| GET    | `/api/auth/me`              | Private  | Current authenticated user |
| GET    | `/api/users/profile`        | Private  | Get profile                |
| PATCH  | `/api/users/profile`        | Private  | Update name / avatar       |
| PATCH  | `/api/users/change-password`| Private  | Change password            |
| GET    | `/api/health`               | Public   | Server + DB status         |

---

## Security Notes

- Passwords are hashed with **bcrypt** (salt rounds = 12).
- JWT is stored in an **httpOnly** cookie (not accessible from JavaScript).
- In production (`NODE_ENV=production`) cookies are set with `Secure` and `SameSite=None`.
- Rate limiting is applied to auth routes.
- Role is always assigned server-side (`user`). Clients cannot escalate privileges.
- Password hashes and JWT secret are never sent to the frontend.
- Helmet and basic input validation/sanitization are enabled.

---

## Deployment

The application is a **persistent Node.js Express server**. It needs a host that supports:

- Long-running Node processes
- Environment variables
- Outbound network access to MongoDB Atlas

### Compatible platforms (examples)

| Platform          | Notes                                                                 |
|-------------------|-----------------------------------------------------------------------|
| **Railway**       | Easy. Set env vars, connect GitHub, deploy.                           |
| **Render**        | Web Service. Set build command `npm run build`, start `npm start`.    |
| **DigitalOcean App Platform / Droplet** | Full control.                                       |
| **Heroku**        | Classic Node dyno.                                                    |
| **AWS / GCP / Azure** | Any VM or container that can run Node.                            |
| **Fly.io**        | Good for containers.                                                  |

### Not suitable without extra config

- **Pure static hosts** (Netlify, GitHub Pages, Cloudflare Pages alone) – they cannot run Express.
- **Vercel** – can work with serverless functions, but the current `app.listen()` + filesystem SPA pattern needs adaptation (API routes as serverless functions + static frontend). Do **not** assume the current code works unchanged on Vercel.

### Typical production steps

1. Push the repo (without `.env` and `node_modules`).
2. On the host, set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `PORT` (often provided by the host)
   - `CLIENT_URL` (your production domain, if needed for CORS)
3. Build command: `npm install && npm --prefix web install && npm run build`
4. Start command: `npm start`
5. Ensure MongoDB Atlas Network Access allows the host’s IP (or `0.0.0.0/0`).

### HTTPS & cookies

Most platforms terminate SSL. With `NODE_ENV=production` the app sets `Secure` cookies automatically. If your host is behind a reverse proxy, you may need:

```js
app.set('trust proxy', 1);
```

(add this near the top of `server.js` if cookies fail in production).

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `MongoDB connection error` | Check `MONGODB_URI`, username/password, and Atlas Network Access. |
| `JWT_SECRET is not defined` | Ensure `.env` exists and contains `JWT_SECRET`. Restart the server. |
| Frontend shows blank / 404 after build | Run `npm run build` so `web/build` exists, then `npm start`. |
| CORS errors in development | Confirm `CLIENT_URL=http://localhost:5173` and that you are using the Vite URL (5173), not 5000. |
| Cookie not set / logout not working | In production make sure `NODE_ENV=production` and you are on HTTPS. |
| Port already in use | Change `PORT` in `.env` or kill the process using that port. |
| `Cannot find module` | Run `npm install` and `npm --prefix web install` again. |
| React Router 404 on refresh (production) | The SPA fallback in `server.js` must be registered **after** API routes. It already is. |

---

## Scripts reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Express (nodemon) + Vite concurrently |
| `npm run server:dev` | Express only with nodemon |
| `npm run client:dev` | Vite only |
| `npm run build` | Build React app into `web/build` |
| `npm start` | Run production server (serves API + built frontend) |

---

## License

MIT
