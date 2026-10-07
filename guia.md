# Guía de Puesta en Marcha — Incubadora de Huevos con ESP32 🐣

Esta guía detalla la arquitectura, requisitos y el paso a paso completo para levantar el sistema de monitoreo y control de la incubadora de huevos.

---

## 🏗️ 1. Arquitectura del Sistema

El sistema consta de 4 capas integradas:

1. **Hardware / IoT (ESP32 + DHT11):**
   - Sensor de temperatura y humedad **DHT11** conectado al **GPIO 27** del ESP32.
   - **LEDs indicadores:** GPIO 25 (Rojo = lectura/error) y GPIO 26 (Verde = envío exitoso).
   - Conexión Wi-Fi gestionada con **WiFiManager** (sin necesidad de hardcodear credenciales).
   - Envío de telemetría a **ThingSpeak** (Canal ID: `3442278`, `field1`=Temperatura, `field2`=Humedad) cada **20 segundos**.

2. **Base de Datos (MySQL / MariaDB en XAMPP):**
   - Base de datos: `encubadora_db` (puerto: `3306`).
   - Tablas: `users`, `settings`, `readings`.

3. **Servidor Backend (Node.js + Express):**
   - Ubicación: `backend/` — Puerto: `http://localhost:3001`
   - **Worker automático:** consulta ThingSpeak cada **60 segundos** y guarda las lecturas nuevas en MySQL.
   - **API REST:** Autenticación JWT, CRUD de usuarios (crear, leer, editar, eliminar), configuración de umbrales y control de ciclo de incubación.

4. **Cliente Frontend (Vue 3 + Vite + Tailwind CSS):**
   - Puerto: `http://localhost:8080`
   - Panel de control en tiempo real con: indicador de estado del ESP32, temperatura/humedad en vivo, gráficas históricas (Chart.js), alertas visuales/sonoras, guías de incubación por ave y gestión completa de usuarios.

---

## 🔑 2. Credenciales de Acceso

| Recurso | Valor |
|---|---|
| **URL Aplicación Web** | http://localhost:8080 |
| **URL API Backend** | http://localhost:3001 |
| **Admin Email** | `admin@admin.com` |
| **Admin Contraseña** | `admin123` |
| **MySQL Host** | `localhost` |
| **MySQL Puerto** | `3306` |
| **MySQL Usuario** | `root` |
| **MySQL Contraseña** | *(vacía por defecto en XAMPP)* |
| **Base de Datos** | `encubadora_db` |
| **ThingSpeak Canal** | `3442278` |
| **ThingSpeak Read Key** | `J92EB8NUEOJF1IAN` |
| **ThingSpeak Write Key** | `EITBHFT7KA1M9P72` |

---

## 📋 3. Requisitos Previos

Instala en tu equipo:

1. **[XAMPP](https://www.apachefriends.org/)** con servicio MySQL activado.
2. **[Node.js 20 LTS+](https://nodejs.org/)** y npm.
3. **[Arduino IDE](https://www.arduino.cc/en/software)** (para programar el ESP32).
   - Librería **DHT sensor library** by Adafruit.
   - Librería **WiFiManager** by tzapu.
   - Librería **ThingSpeak** by MathWorks.

---

## 🚀 4. Puesta en Marcha Manual

### Paso 1: Iniciar MySQL en XAMPP
1. Abre el **XAMPP Control Panel**.
2. Pulsa **Start** en el módulo **MySQL** (aparece el puerto `3306` en verde).

---

### Paso 2: Crear la Base de Datos (solo la primera vez)

#### Opción A: Terminal PowerShell
```powershell
# Ejecutar desde: c:\xampp\htdocs\ENCUBADORA DE HUEVO-ARDUINO
Get-Content init.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root
Get-Content settings.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root
Get-Content alter.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root
```

#### Opción B: phpMyAdmin
1. Abre http://localhost/phpmyadmin
2. Crea la base de datos `encubadora_db` (cotejamiento: `utf8mb4_general_ci`).
3. Selecciona `encubadora_db` → pestaña **Importar**.
4. Importa en orden: `init.sql` → `settings.sql` → `alter.sql`.

---

### Paso 3: Levantar el Backend (API & Worker)
```bash
cd "c:\xampp\htdocs\ENCUBADORA DE HUEVO-ARDUINO\backend"
npm install        # solo la primera vez
node index.js
```
Verás en consola:
```
Backend server running on http://localhost:3001
ThingSpeak iniciado.
[Worker] Dato insertado/ignorado: Temp=36.80, Hum=21.90 at 2026-09-18 19:55:51
```

---

### Paso 4: Levantar el Frontend
```bash
cd "c:\xampp\htdocs\ENCUBADORA DE HUEVO-ARDUINO"
npm install        # solo la primera vez
npm run dev
```
Verás en consola:
```
VITE ready in XXX ms
➜  Local:   http://localhost:8080/
```
Accede a http://localhost:8080 e inicia sesión con `admin@admin.com` / `admin123`.

---

## ⚡ 5. Inicio Automático con 1 Clic

Haz doble clic en **`iniciar_sistema.bat`** — abre el backend y el frontend en ventanas separadas automáticamente.

---

## 📡 6. Configuración del ESP32

1. Abre `codigoesp32.ino` en el **Arduino IDE**.
2. Carga el sketch en tu placa ESP32.
3. En el primer arranque (o si no encuentra la red), el ESP32 crea un punto de acceso Wi-Fi:
   - **Red:** `ESP32-DHT11`
   - **Clave:** `12345678`
4. Conéctate desde tu celular y en la pantalla que aparece ingresa la contraseña de tu Wi-Fi de casa.
5. El ESP32 se reinicia y comienza a enviar datos a ThingSpeak cada 20 segundos.
6. **LED Verde** = dato enviado correctamente | **LED Rojo parpadeando** = leyendo / error.

---

## 🌐 7. Endpoints de la API REST

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/login` | ❌ | Iniciar sesión → devuelve JWT |
| `GET` | `/api/users` | Admin | Listar todos los usuarios |
| `POST` | `/api/users` | Admin | Crear nuevo usuario |
| `PUT` | `/api/users/:id` | Admin | **Editar** nombre, email, contraseña, rol |
| `DELETE` | `/api/users/:id` | Admin | Eliminar usuario |
| `GET` | `/api/readings` | Auth | Historial paginado (`?page=1&limit=20`) |
| `GET` | `/api/readings/latest` | Auth | Última lectura de temperatura/humedad |
| `GET` | `/api/settings` | Auth | Leer configuración de umbrales y ciclo |
| `POST` | `/api/settings` | Admin | Actualizar umbrales de temperatura/humedad |
| `POST` | `/api/settings/start` | Admin | Iniciar ciclo de incubación (`{ bird_type }`) |
| `POST` | `/api/settings/stop` | Admin | Detener ciclo de incubación |

---

## 🔧 8. Solución de Problemas

### ❌ Error: "ECONNREFUSED 127.0.0.1:3306"
**Causa:** MySQL de XAMPP no está activo.  
**Solución:** Abre XAMPP Control Panel → **Start** en MySQL.

### ❌ Contraseña de administrador no funciona
```bash
cd backend
node reset-admin.js
```
Esto restablece la contraseña de `admin@admin.com` a `admin123`.

### ❌ Puerto 3001 u 8080 ocupado
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
```

### ❌ El indicador del ESP32 siempre aparece "Desconectado"
- El ESP32 necesita estar encendido y con conexión a internet activa.
- El indicador se considera "En Línea" si la última lectura recibida fue hace **menos de 3 minutos**.
- Verifica que el sketch esté cargado en la placa y que el Wi-Fi esté configurado.

### ❌ Las lecturas no se actualizan
- El backend consulta ThingSpeak cada 60 segundos. Espera al menos 2 minutos.
- Verifica tu conexión a internet.
- Confirma que el ESP32 está enviando datos: abre el [canal de ThingSpeak](https://thingspeak.com/channels/3442278) y comprueba que la última actualización es reciente.
