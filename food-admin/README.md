# Biteboard Admin

Standalone, responsive React admin application for the FoodieGo backend.

## Run locally

1. Start the backend from `backend/` with `npm start`.
2. From this folder, install dependencies with `npm install`.
3. Copy `.env.example` to `.env` if the API is not at `http://localhost:5000/api`, then set `VITE_API_URL`.
4. Run `npm run dev` and open the local Vite URL.
5. Sign in with an existing active user whose role is `admin`.

For the first administrator only, set `ADMIN_NAME`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD` (at least 12 characters) in the backend environment, then run `npm run admin:create` from `backend/`. The setup command refuses to create another administrator if one already exists. The app uses the backend's JWT login and does not expose public admin registration.

## Admin capabilities

- Dashboard totals, recent orders, and order value over the last seven days
- Restaurant approval, open/closed state, and visibility
- Food item create/edit/deactivate across restaurants
- Category create/edit/deactivate
- Order status management
- User account creation for restaurant owners and delivery users, plus account activation
- Coupon create/edit/deactivate
- Delivery partner onboarding, online status, and availability

All management endpoints require a valid administrator JWT. The API URL can be changed using `VITE_API_URL`.
