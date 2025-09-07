
---

# How to Run

## 0) Clone

```bash
git clone <your-repo-url>.git
cd <your-repo-name>
```

---

## 1) Start Dependencies

* **PostgreSQL** (13+)

  * Create a DB and (optionally) a user that match your env (see step 2).
  * Example:

    ```bash
    # Linux/macOS example
    createdb Outspire
    psql -d postgres -c "CREATE USER prabhab WITH PASSWORD 'prabhab';"
    psql -d postgres -c "ALTER DATABASE Outspire OWNER TO prabhab;"
    ```
* **Redis** (for Channels/websockets)

  ```bash
  # start redis locally
  redis-server
  ```

  Redis must be reachable at `127.0.0.1:6379`.

---

## 2) Backend (Django + ASGI)

```bash
cd Backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `Backend/.env` (values here match your `settings.py` defaults — change as needed):

```
# Django
SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=*

# PostgreSQL (your settings.py reads these keys)
POSTGRES_DB=Outspire
POSTGRES_USER=prabhab
POSTGRES_PASSWORD=prabhab
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Redis / Channels
REDIS_URL=redis://127.0.0.1:6379/0

# CORS/CSRF (match your frontends)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8081
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://localhost:8081

# Email (use real creds only in local env, never commit)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=outspirenoreply@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=outspirenoreply@gmail.com

# Third-party
GOOGLE_CLIENT_ID=your-google-client-id
KHALTI_PUBLIC_KEY=your-khalti-public
KHALTI_SECRET_KEY=your-khalti-secret
```

Apply DB migrations and create an admin:

```bash
python manage.py migrate
python manage.py createsuperuser
```

Run the app (ASGI recommended because you’re using Channels):

```bash
# Option A: uvicorn (recommended)
pip install uvicorn
uvicorn Backend.asgi:application --host 0.0.0.0 --port 8000

# Option B: daphne
# pip install daphne
# daphne -b 0.0.0.0 -p 8000 Backend.asgi:application

# (Fallback dev-only: runserver works for basic HTTP, but not proper websockets)
# python manage.py runserver 0.0.0.0:8000
```

* Backend API: [http://localhost:8000](http://localhost:8000)
* Django Admin: [http://localhost:8000/admin/](http://localhost:8000/admin/)

---

## 3) Web Admin (Vite + React)

```bash
cd ../admin-panel
npm install
```

Create `admin-panel/.env`:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
```

Run:

```bash
npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

---

got it — **Expo Go only, no emulators**. Replace your mobile section with this:

---

## 4) Mobile App (React Native + **Expo Go**)

```bash
cd ../Frontend
npm install
npm start   # or: expo start
```



### Run on your phone with Expo Go

1. Install **Expo Go** from the App Store / Google Play.
2. Make sure phone and computer are on the **same Wi-Fi**.
3. After `npm start`, a **QR code** appears in the terminal/DevTools.
4. Open **Expo Go** and **scan the QR** to load the app.




## Notes that matter

* **Use ASGI (uvicorn/daphne)** so Channels + Redis websockets work.
* Ensure **Redis** is running before starting the backend.
* If requests are blocked, check **CORS/CSRF** origins match the ports you’re using.

---


