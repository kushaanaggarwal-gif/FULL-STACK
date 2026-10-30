# Experiment 7: Secure APIs Frontend

This folder contains a minimalistic, zero-dependency frontend designed to demonstrate a backend implementing JWT Authentication, Role-Based Access Control (RBAC), Server-Side AES Encryption, and Token Management.

## How to run the frontend
Since this is plain HTML/CSS/JS, you can simply open `index.html` in your web browser. 
Alternatively, use a tool like Live Server in VSCode or a simple Python server:
```bash
cd "exp 7"
python -m http.server 3000
```
Then navigate to `http://localhost:3000`.

## Backend Requirements
The frontend expects a REST API running on `http://localhost:8080/api` (Spring Boot default). You should reuse your existing backend code to implement these endpoints. 

### CORS Configuration
Ensure your Spring Boot backend has **CORS enabled** so this frontend can communicate with it:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedOrigins("*").allowedMethods("*");
    }
}
```

### Expected Endpoints to Implement (or adjust the `script.js` to match yours):

**1. Health Check**
- `GET /api/health` 
- Returns anything just to prove the server is alive.

**2. Authentication**
- `POST /api/auth/login`
- Body: `{ "username": "user", "password": "password" }`
- Expected Response (200 OK): `{ "token": "ey..." }`

**3. Protected Testing**
- `GET /api/test` (Requires JWT Token in `Authorization: Bearer <token>` header)

**4. Role-Based Access Control (RBAC)**
- `GET /api/user` (Requires USER or ADMIN role)
- `GET /api/admin` (Requires ADMIN role only)

**5. Encryption & Decryption**
*(Keys must remain server-side!)*
- `POST /api/crypto/encrypt`
  - Body: `{ "data": "plain text" }`
  - Expected Response (200 OK): `{ "encryptedData": "..." }`
- `POST /api/crypto/decrypt`
  - Body: `{ "data": "encrypted base64 text" }`
  - Expected Response (200 OK): `{ "decryptedData": "plain text" }`

**6. Token Management (Optional / Advanced)**
- `POST /api/auth/refresh`
  - Body: `{ "token": "old token" }`
  - Expected Response (200 OK): `{ "token": "new token" }`

## Notes for Viva/Demonstration
- You can navigate the tabs using the top navigation bar.
- If some features are not implemented in the backend, they will simply report `404 Not Found` or `Error`, which correctly indicates they are missing. Do not hardcode success values in the frontend.
- The `Test Reports` tab attempts to automatically call endpoints as different users and expects standard HTTP status codes (like `200`, `401 Unauthorized`, `403 Forbidden`).
