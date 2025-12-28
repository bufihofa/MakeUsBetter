# MakeUsBetter 💑

Ứng dụng giúp hai người yêu chia sẻ và thấu hiểu cảm xúc của nhau theo thời gian thực.

## Tech Stack

### Frontend
- React + TypeScript + Vite
- Capacitor (Android)
- React Router DOM

### Backend
- NestJS
- PostgreSQL (TypeORM)
- Firebase Admin SDK (FCM)
- JWT Authentication

### Infrastructure
- **Database**: Aiven (free tier)
- **Backend Hosting**: Render (free tier)
- **Push Notifications**: Firebase Cloud Messaging
- **CI/CD**: GitHub Actions

## Features

✅ Ghép cặp bằng mã 6 ký tự  
✅ Chia sẻ cảm xúc (Plutchik's 8 emotions)  
✅ Điều chỉnh cường độ cảm xúc (1-100%)  
✅ Push notifications real-time  
✅ Xem lịch sử cảm xúc theo calendar  
✅ Dark theme UI hiện đại  

## Getting Started

### Prerequisites
- Node.js 20+
- Android Studio (for building APK)
- PostgreSQL database
- Firebase project

### 1. Setup Backend

```bash
cd backend
npm install

# Copy và cấu hình environment
cp .env.example .env
# Edit .env với database URL và Firebase credentials

npm run start:dev
```

### 2. Setup Frontend

```bash
cd frontend
npm install

# Copy và cấu hình environment
cp .env.example .env
# Edit .env với API URL

npm run dev
```

### 3. Build Android APK

```bash
cd frontend

# Build web assets
npm run build

# Sync với Capacitor
npx cap sync android

# Mở Android Studio
npx cap open android
```

Trong Android Studio, build APK qua Build > Build Bundle(s) / APK(s) > Build APK(s)

## Firebase Setup

1. Tạo project tại [Firebase Console](https://console.firebase.google.com)
2. Enable Cloud Messaging
3. Download `google-services.json` → `frontend/android/app/`
4. Generate Service Account Key cho backend
5. Cấu hình environment variables

## GitHub Secrets (for CI/CD)

Thêm các secrets sau vào repository:

| Secret | Description |
|--------|-------------|
| `API_URL` | Backend API URL (e.g., https://makeusbetter-api.onrender.com/api) |
| `GOOGLE_SERVICES_JSON` | Nội dung file google-services.json |
| `KEYSTORE_BASE64` | Base64 encoded keystore (for release builds) |
| `KEYSTORE_PASSWORD` | Keystore password |
| `KEY_ALIAS` | Key alias |
| `KEY_PASSWORD` | Key password |

## Project Structure

```
MakeUsBetter/
├── backend/                # NestJS API
│   ├── src/
│   │   ├── entities/       # TypeORM entities
│   │   ├── modules/        # Feature modules
│   │   │   ├── pair/       # Pairing logic
│   │   │   ├── emotion/    # Emotion CRUD
│   │   │   ├── user/       # User management
│   │   │   └── notification/ # FCM integration
│   │   └── common/         # Guards, decorators
│   └── .env.example
├── frontend/               # React + Capacitor
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # App pages
│   │   ├── services/       # API, storage, FCM
│   │   └── types/          # TypeScript types
│   └── android/            # Native Android project
└── .github/workflows/      # CI/CD
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/pair/create | Tạo pair code mới |
| POST | /api/pair/join | Join vào pair |
| GET | /api/pair/partner | Lấy thông tin partner |
| POST | /api/emotions | Log cảm xúc mới |
| GET | /api/emotions/calendar | Lấy cảm xúc theo tháng |
| GET | /api/emotions/today | Lấy cảm xúc hôm nay |
| PUT | /api/user/fcm-token | Cập nhật FCM token |

## License

MIT
