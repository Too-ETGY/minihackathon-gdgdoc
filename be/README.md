# API Documentation - Mini Hackathon GDG

Backend API yang dibangun menggunakan Express.js dan Supabase untuk sistem pelaporan lokasi berbasis geografis (PostGIS).

## Persiapan

1.  **Clone Repository**
2.  **Install Dependensi**
    ```bash
    npm install
    ```
3.  **Konfigurasi Environment**
    Buat file `.env` dan isi dengan kredensial Supabase Anda:
    ```env
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    PORT=3000
    ```
4.  **Jalankan Server**
    ```bash
    node index.js
    ```

---

## Endpoint API

### 1. Categories (`/api/categories`)

Digunakan untuk mengelola kategori lokasi.

| Method   | Endpoint              | Deskripsi             | Body (JSON)                                |
| :------- | :-------------------- | :-------------------- | :----------------------------------------- |
| `GET`    | `/api/categories`     | Ambil semua kategori  | -                                          |
| `GET`    | `/api/categories/:id` | Ambil kategori detail | -                                          |
| `POST`   | `/api/categories`     | Tambah kategori baru  | `{"name": "string", "icon_url": "string"}` |
| `PUT`    | `/api/categories/:id` | Update kategori       | `{"name": "string", "icon_url": "string"}` |
| `DELETE` | `/api/categories/:id` | Hapus kategori        | -                                          |

### 2. Locations (`/api/locations`)

Digunakan untuk mengelola data lokasi dengan koordinat PostGIS.

| Method   | Endpoint                | Deskripsi            | Body / Query Params                                                                               |
| :------- | :---------------------- | :------------------- | :------------------------------------------------------------------------------------------------ |
| `GET`    | `/api/locations`        | Ambil semua lokasi   | -                                                                                                 |
| `GET`    | `/api/locations/nearby` | Cari lokasi terdekat | `?lat=-6.2&long=106.8&radius=1000` (radius dlm meter)                                             |
| `POST`   | `/api/locations`        | Tambah lokasi baru   | `{"category_id": "uuid", "name": "string", "description": "text", "lat": number, "long": number}` |
| `PUT`    | `/api/locations/:id`    | Update lokasi        | `{"name": "string", "lat": number, ...}`                                                          |
| `DELETE` | `/api/locations/:id`    | Hapus lokasi         | -                                                                                                 |

### 3. Reports (`/api/reports`)

Digunakan untuk melaporkan masalah di suatu lokasi.

| Method   | Endpoint           | Deskripsi           | Body (JSON)                                            |
| :------- | :----------------- | :------------------ | :----------------------------------------------------- |
| `GET`    | `/api/reports`     | Ambil semua laporan | -                                                      |
| `POST`   | `/api/reports`     | Buat laporan baru   | `{"location_id": "uuid",: "uuid", "reason": "string"}` |
| `DELETE` | `/api/reports/:id` | Hapus laporan       | -                                                      |

---

## SQL Setup (Supabase SQL Editor)

Pastikan menjalankan SQL berikut di dashboard Supabase agar fitur `nearby` dan `increment` berjalan:

```sql
-- 1. Fungsi Pencarian Radius (PostGIS)
create or replace function get_locations_nearby(lat float, long float, radius_meters float)
returns setof locations as $$
begin
  return query
  select *
  from locations
  where st_dwithin(coords, st_setsrid(st_makepoint(long, lat), 4326)::geography, radius_meters);
end;
$$ language plpgsql;

-- 2. Fungsi Auto-Increment Report Count
create or replace function increment_report_count(loc_id uuid)
returns void as $$
begin
  update locations
  set report_count = report_count + 1
  where id = loc_id;
end;
$$ language plpgsql;
```
