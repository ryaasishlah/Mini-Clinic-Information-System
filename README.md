# Mini Clinic Information System

Take Home Test Submission untuk Posisi Programmer.

## Overview

Mini Clinic Information System adalah aplikasi berbasis web untuk mengelola proses administrasi dan pelayanan pasien di klinik secara terintegrasi.

Aplikasi ini mendukung fitur-fitur berikut:

- Authentication & Role-Based Authorization
- CRUD Master Data Pasien
- Pendaftaran Kunjungan
- Sistem Antrean Otomatis (dengan Text-to-Speech)
- Pemeriksaan Dokter (SOAP)
- Rekam Medis Terintegrasi (Tindakan Medis & Resep Obat)
- Dashboard Statistik Real-time

---

## Tech Stack

### Backend

- Node.js
- Express.js
- Prisma ORM
- MySQL
- JSON Web Token (JWT)
- Bcrypt
- Postman

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router Dom
- Axios
- Lucide React
- React Hot Toast

---

## Project Structure

```
Mini-Clinic-Information-System
│
├── backend
│
├── frontend
│
├── Mini_Clinic_Postman_Collection.json
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/ryaasishlah/Mini-Clinic-Information-System.git
cd Mini-Clinic-Information-System
```

---

### Backend

```bash
cd backend

npm install
```

Buat file `.env`

```env
PORT=5000
DATABASE_URL="mysql://root:@localhost:3306/mini_clinic"
JWT_SECRET="your_jwt_secret"
```

Jalankan Migration & Seed

```bash
npx prisma migrate dev
npm run seed
```

Generate Prisma Client

```bash
npx prisma generate
```

Jalankan Backend

```bash
npm run dev
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## API Documentation

API Collection tersedia di dalam file berikut:

```
Mini_Clinic_Postman_Collection.json
```

Silakan _import collection_ tersebut ke dalam aplikasi Postman untuk melakukan _testing_ seluruh _endpoints_.

---

## Features

### Authentication

- Login
- Logout
- Role Authorization (Admin, Doctor, Receptionist)

### Patient

- Auto-generate RM (Nomor Rekam Medis)
- Validasi NIK Terdaftar
- CRUD Data Pasien

### Registration & Queue

- Pendaftaran Kunjungan Baru
- Auto-generate Nomor Antrean (contoh: A001)
- Pemanggilan Antrean (Voice TTS)
- Pelacakan Status (_Status Tracking_)

### Medical Record

- Form SOAP (Subjective, Objective, Assessment, Plan)
- Dynamic Medical Actions (Tindakan Medis Dinamis)
- Dynamic Prescriptions (Resep Obat Dinamis)

---

## Demo Accounts

(Password untuk semua akun: **`password123`**):

- **Administrator**: Username: `admin`
- **Doctor**: Username: `dokter`
- **Receptionist**: Username: `petugas`

---

## Database

Database dibangun menggunakan Prisma ORM dengan _driver_ MySQL.

Entitas utama (_Main Entities_):

- User
- Patient
- Polyclinic
- Registration
- Queue
- MedicalRecord
- MedicalAction
- Prescription

---

## Author

**Ryaas Ishlah Ramadhan**

Technical Test Submission — Programmer
