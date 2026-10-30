# Experiment 3: Full-Stack Role-Based Access Control (RBAC) & Route Protection

A production-grade, minimalistic full-stack web application demonstrating JWT authentication, automated token rotation via Axios interceptors, protected routes, RBAC guards, and conditional UI rendering.

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite), React Router v6, Axios (with Request/Response Interceptors), React Context API, Lucide Icons, Minimalist CSS.
- **Backend / API**: Node.js, Express, `jsonwebtoken` (JWT), `cors`, `dotenv`.

---

## 🔐 Mock Credentials & Role Permissions

| Role | Email | Password | Permissions | Accessible Routes | Action Rights |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@app.com` | `password123` | `create`, `edit`, `delete`, `read` | `/dashboard`, `/editor-panel`, `/admin-panel` | View, Edit, Delete Content |
| **Editor** | `editor@app.com` | `password123` | `create`, `edit`, `read` | `/dashboard`, `/editor-panel` | View, Edit Content |
| **Viewer** | `viewer@app.com` | `password123` | `read` | `/dashboard` | View Content Only |

*Note: Quick 1-click test login buttons are provided on the `/login` page.*

---

## 🧠 Architectural Concepts Explained

### 1. JWT Structure (`HEADER.PAYLOAD.SIGNATURE`)
A JSON Web Token consists of three base64url-encoded parts separated by periods (`.`):
1. **Header**: Contains metadata such as the algorithm used (`HS256`) and the token type (`JWT`).
2. **Payload**: Contains the claims (e.g., `userId`, `email`, `role`, permissions, and expiration `exp`).
3. **Signature**: Cryptographic hash calculated as `HMACSHA256(base64Url(header) + "." + base64Url(payload), secret)`. Ensures token integrity and prevents tampering.

### 2. Silent Refresh Flow with Axios Interceptors
- **Request Interceptor**: Automatically attaches `Authorization: Bearer <accessToken>` to every outgoing request.
- **Response Interceptor**: Intercepts `401 Unauthorized` responses (when access token expires after 15 seconds). It pauses outgoing calls, triggers `POST /api/refresh-token` with the long-lived refresh token, stores the newly minted access token, and automatically retries the failed original request seamlessly without logging the user out.

### 3. RBAC Route Guards & Conditional UI
- `ProtectedRoute`: Ensures the user has an active session; otherwise redirects to `/login`.
- `RoleGuard`: Compares the user's role against `allowedRoles` (e.g., `['Admin', 'Editor']`); redirects unauthorized users to `/unauthorized` (403).
- **Conditional UI**: "Delete Content" is rendered only for `Admin`; "Edit Content" is rendered for `Admin` and `Editor`; "View Content" is accessible to all.

---

## 🚀 How to Run Locally

### 1. Start Backend Server
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 2. Start Frontend Client
```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

---

## 🧪 Testing the Automated Refresh Interceptor
1. Log in with any user (e.g., Admin).
2. Look at the **Token Rotation & Interceptor Live Monitor** on the right side of the dashboard.
3. Click **"Simulate Token Expiration"** (or wait 15 seconds for natural expiry).
4. Click any action (e.g. "Trigger API Call" or "Edit Article").
5. Watch the live console stream capture the `401 Unauthorized`, dispatch silent refresh `POST /api/refresh-token`, receive the new Access Token, and replay the original request with `200 OK`!
