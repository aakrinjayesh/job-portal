# Job Portal Full Stack Application

This is a **full-stack job portal** project with:

- **Frontend:** React + Vite
- **Backend:** Node.js + Express + Prisma ORM + PostgreSQL
- **Database:** PostgreSQL

---

## 📂 Project Structure

```
job-portal/
│── backend/      # Node.js + Express + Prisma + PostgreSQL
│── frontend/     # React + Vite
│── README.md     # Project documentation
```

---

## ⚡ Requirements

- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/download/) (local or remote)
- [Prisma](https://www.prisma.io/) (installed via npm)

---

## 🔧 Backend Setup (Node.js + Prisma + PostgreSQL)

1. Navigate to backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in backend:

```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<dbname>?schema=public"
```

4. Prisma setup:

- Generate Prisma Client:

```bash
npx prisma generate
```

- Run migrations (creates tables based on schema):

```bash
npx prisma migrate dev --name init
```

- Open Prisma Studio (GUI to view/edit DB):

```bash
npx prisma studio
```

5. Run backend server:

```bash
npm run dev
```

Backend server runs at: `http://localhost:5000`

---

## 🎨 Frontend Setup (React + Vite)

1. Navigate to frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run frontend dev server:

```bash
npm run dev
```

Frontend server runs at: `http://localhost:5173`

---

## 🛠️ Useful Scripts

### Backend

| Command                                | Description               |
| -------------------------------------- | ------------------------- |
| `npm run dev`                          | Start backend in dev mode |
| `npx prisma generate`                  | Generate Prisma Client    |
| `npx prisma migrate dev --name <name>` | Run database migration    |

### Frontend

| Command           | Description               |
| ----------------- | ------------------------- |
| `npm run dev`     | Start Vite dev server     |
| `npm run build`   | Build production frontend |
| `npm run preview` | Preview production build  |

---

## 🚀 Running Full Stack Locally

1. Make sure PostgreSQL is running.
2. Start backend:

```bash
cd backend && npm run dev
```

3. Start frontend:

```bash
cd frontend && npm run dev
```

4. Open in browser: `http://localhost:5173`  
   Frontend will communicate with backend APIs (`http://localhost:5000`).

---

## ✅ Notes

- Update `.env` with correct `DATABASE_URL`.
- After modifying `schema.prisma`, always run:

```bash
npx prisma migrate dev --name <name>
npx prisma generate
```

- Use Prisma Studio to quickly check or edit database entries:

```bash
npx prisma studio
```

- For authentication with GitHub or other services, make sure your `.env` contains required keys.

---

## Optional: Docker Setup

If you want to containerize:

- Create a `docker-compose.yml` for **backend + PostgreSQL**
- Run:

```bash
docker-compose up
```

- Then run frontend separately with `npm run dev`.
