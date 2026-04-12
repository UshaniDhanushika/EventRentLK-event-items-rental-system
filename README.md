# RentNova — Event Equipment Rental

Small full-stack demo: browse event gear, add to cart, and submit a rental request with dates and contact info.

## Stack

- **Frontend:** React (Vite) — catalog, cart, checkout
- **Backend:** Spring Boot 3 — REST API
- **Database:** MongoDB

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (for the React app)
- [JDK 17+](https://adoptium.net/) and [Maven](https://maven.apache.org/) (for the API), or use your IDE’s Spring Boot run configuration
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on the default port (`27017`), or change the URI below

## MongoDB

Default connection in `backend/src/main/resources/application.properties`:

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/event_rental
```

Start `mongod` before the API. On first run, sample equipment is inserted automatically if the collection is empty.

## Run the API

**Start the API before `npm run dev`.** If the React app shows Vite `http proxy error` / `ECONNREFUSED`, nothing is listening on port 8080 (usually the Spring Boot app is not running yet, or it exited because MongoDB was down).

### Windows (no global Maven)

From the project root:

```powershell
.\start-backend.ps1 spring-boot:run
```

Or from `backend`:

```powershell
.\mvnw.cmd spring-boot:run
```

The wrapper downloads Apache Maven on first use. You still need `JAVA_HOME` set to a JDK; if `java` works in PowerShell but `JAVA_HOME` is empty, `start-backend.ps1` tries to infer it.

### With Maven installed

```bash
cd backend
mvn spring-boot:run
```

API listens on **http://localhost:8080** (Vite proxies `/api` to `127.0.0.1:8080`).

- `GET /api/equipment` — list (optional `?category=Audio`)
- `GET /api/equipment/{id}` — one item
- `POST /api/rentals` — create rental (JSON body with customer fields and `lines` with `equipmentId`, `quantity`, `startDate`, `endDate`)
- `GET /api/rentals` — list orders (demo only; protect or remove in production)

## Run the React app

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Vite proxies `/api` to the Spring Boot server during development.

### Production build / different API host

```bash
cd frontend
npm run build
```

Set `VITE_API_URL` when the UI is not served with a proxy, for example:

```bash
set VITE_API_URL=http://localhost:8080
npm run build
```

## Project layout

```
rentnova/
├── backend/          # Spring Boot + Spring Data MongoDB
└── frontend/         # Vite + React
```

## Notes

- Stock is validated on submit but **not** decremented (you can add inventory updates later).
- There is **no authentication**; treat this as a learning template, not production-ready security.
