# Frontend (Next.js)

## Run the UI

```bash
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

## Backend API

The app talks to the backend at **http://localhost:5000/api** by default.

- Start the backend first: `cd backend && node server.js`
- If your API is on another URL, create `.env.local` in this folder with:
  ```
  NEXT_PUBLIC_API_URL=http://your-api-host:5000/api
  ```

## First time

1. Go to http://localhost:3000
2. You will be redirected to the **Login** page
3. Log in with an admin/reseller/client account (create one via backend seed or register)
4. After login you will see the dashboard for your role (Admin / Reseller / Client)
