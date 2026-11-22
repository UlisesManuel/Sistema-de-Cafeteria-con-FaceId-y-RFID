# Sistema-de-Cafeteria-con-FaceId-y-RFID
Sistema web de cafetería con autenticación y validación mediante reconocimiento facial. Para la materia de Tecnologías Web II


## Instrucción de Intalación
**FrontEnd**
pnpm install 
pnpm run dev

**BackEnd**
    python -m venv venv
    source venv/bin/activate  # En Linux/Mac

    pip install -r requirements.txt
    pip install git+https://github.com/ageitgey/face_recognition_models

    *Ejecución*
    uvicorn main:app --reload --host 0.0.0.0 --port 8000


## Estrucutura dek frontend
frontend/
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   └── loading.tsx
│   │   │
│   │   └── layout/
│   │       ├── sidebar.tsx
│   │       ├── header.tsx
│   │       └── admin-layout.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   └── login-form.tsx
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   │
│   │   ├── attendance/
│   │   │   ├── components/
│   │   │   │   ├── rfid-scanner.tsx
│   │   │   │   ├── facial-recognition.tsx
│   │   │   │   ├── attendance-status.tsx
│   │   │   │   └── attendance-result.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-rfid.ts
│   │   │   │   └── use-camera.ts
│   │   │   ├── services/
│   │   │   │   └── attendance.service.ts
│   │   │   └── types/
│   │   │       └── attendance.types.ts
│   │   │
│   │   ├── employees/
│   │   │   ├── components/
│   │   │   │   ├── employee-table.tsx
│   │   │   │   ├── employee-form.tsx
│   │   │   │   └── employee-details.tsx
│   │   │   ├── services/
│   │   │   │   └── employee.service.ts
│   │   │   └── types/
│   │   │       └── employee.types.ts
│   │   │
│   │   ├── reports/
│   │   │   ├── components/
│   │   │   │   ├── attendance-table.tsx
│   │   │   │   └── attendance-filters.tsx
│   │   │   ├── services/
│   │   │   │   └── reports.service.ts
│   │   │   └── types/
│   │   │       └── reports.types.ts
│   │   │
│   │   └── users/
│   │       ├── components/
│   │       │   └── user-form.tsx
│   │       ├── services/
│   │       │   └── users.service.ts
│   │       └── types/
│   │           └── users.types.ts
│   │
│   ├── pages/
│   │   ├── login/
│   │   │   └── login-page.tsx
│   │   ├── attendance/
│   │   │   └── attendance-page.tsx
│   │   ├── admin/
│   │   │   ├── dashboard-page.tsx
│   │   │   └── records-page.tsx
│   │   └── systems/
│   │       ├── dashboard-page.tsx
│   │       └── employees-page.tsx
│   │
│   ├── routes/
│   │   ├── app-router.tsx
│   │   └── protected-route.tsx
│   │
│   ├── services/
│   │   └── api.ts
│   │
│   ├── types/
│   │   └── global.types.ts
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── package.json
└── vite.config.ts



## Estructura del backend

backend/
│
├── app/
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── redis.py
│   │
│   ├── database/
│   │   ├── connection.py
│   │   └── base.py
│   │
│   ├── models/
│   │   ├── employee.py
│   │   ├── user.py
│   │   └── attendance.py
│   │
│   ├── schemas/
│   │   ├── employee.py
│   │   ├── user.py
│   │   ├── attendance.py
│   │   └── auth.py
│   │
│   ├── routers/
│   │   ├── auth.py
│   │   ├── employees.py
│   │   ├── attendance.py
│   │   ├── recognition.py
│   │   └── reports.py
│   │
│   ├── services/
│   │   ├── employee_service.py
│   │   ├── attendance_service.py
│   │   ├── auth_service.py
│   │   └── recognition_service.py
│   │
│   ├── facial_recognition/
│   │
│   ├── utils/
│   │   └── datetime_utils.py
│   │
│   └── main.py
│
├── storage/
│   └── face_data/
│
├── requirements.txt
└── ngrok.yml   