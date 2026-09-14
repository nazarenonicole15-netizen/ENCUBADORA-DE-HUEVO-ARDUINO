# Guía de Puesta en Marcha - Incubadora de Huevos con Arduino 🐣

Esta guía detalla la arquitectura, requisitos y el paso a paso para levantar el sistema completo de monitoreo y control de la incubadora de huevos.

---

## 🏗️ 1. Arquitectura del Sistema

El sistema consta de 4 capas integradas:

1. **Hardware / IoT (Arduino + Sensores):**
   - Sensores de temperatura y humedad (DHT11 / DHT22) conectados al Arduino/ESP.
   - Envío de telemetría a la plataforma en la nube **ThingSpeak** (Canal ID: `3442278`).
2. **Base de Datos (MySQL / MariaDB en XAMPP):**
   - Base de datos: `encubadora_db` (puerto por defecto: `3306`).
   - Tablas: `users`, `settings`, `readings`.
3. **Servidor Backend (Node.js + Express):**
   - Ubicación: `backend/`
   - Puerto: `http://localhost:3001`
   - Funciones: Autenticación JWT, gestión de usuarios, configuración de umbrales y sincronizador (worker) automático que consulta ThingSpeak cada 60 segundos y guarda las lecturas en MySQL.
4. **Cliente Frontend (Vue 3 + Vite + TailwindCSS):**
   - Puerto: `http://localhost:8080`
   - Funciones: Panel de control en tiempo real (temperatura, humedad, gráficos históricos, cuenta regresiva de incubación según tipo de ave y gestión de usuarios administradores).

---

## 🔑 2. Credenciales de Acceso

- **URL de la Aplicación Web:** [http://localhost:8080](http://localhost:8080)
- **URL de la API Backend:** [http://localhost:3001](http://localhost:3001)
- **Usuario Administrador:**
  - **Email:** `admin@admin.com`
  - **Contraseña:** `admin123`
  - **Rol:** `ADMIN`
- **Base de Datos MySQL (XAMPP):**
  - **Host:** `localhost`
  - **Puerto:** `3306`
  - **Usuario:** `root`
  - **Contraseña:** *(vacía por defecto en XAMPP)*
  - **Base de Datos:** `encubadora_db`

---

## 📋 3. Requisitos Previos

Asegúrate de tener instalados en tu equipo:
1. **XAMPP** (con servicio MySQL activado).
2. **Node.js** (versión 20.19+ o versión 22 LTS recomendada) y **npm**.

---

## 🚀 4. Paso a Paso para Levantar el Sistema Manualmente

### Paso 1: Iniciar MySQL en XAMPP
1. Abre el **XAMPP Control Panel**.
2. Haz clic en **Start** en el módulo **MySQL** (debe mostrar el puerto `3306` en verde).

---

### Paso 2: Importar la Base de Datos (Solo la primera vez)
Si la base de datos `encubadora_db` aún no está creada, puedes importarla de cualquiera de estas dos formas:

#### Opción A: Desde Terminal PowerShell / CMD
Ejecuta los siguientes comandos desde la raíz del proyecto (`c:\xampp\htdocs\ENCUBADORA DE HUEVO-ARDUINO`):
```powershell
Get-Content init.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root
Get-Content settings.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root
Get-Content alter.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root
```

#### Opción B: Desde phpMyAdmin
1. Abre en tu navegador: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
2. Crea la base de datos `encubadora_db` con cotejamiento `utf8mb4_general_ci`.
3. Selecciona `encubadora_db` y ve a la pestaña **Importar**.
4. Importa secuencialmente:
   - `init.sql`
   - `settings.sql`
   - `alter.sql`

---

### Paso 3: Levantar el Backend (API & Worker)
1. Abre una terminal en la carpeta `backend`:
   ```bash
   cd "c:\xampp\htdocs\ENCUBADORA DE HUEVO-ARDUINO\backend"
   ```
2. Instala las dependencias (si es la primera vez):
   ```bash
   npm install
   ```
3. Inicia el servidor:
   ```bash
   node index.js
   ```
4. Verás en consola:
   ```text
   Backend server running on http://localhost:3001
   [Worker] Dato insertado/ignorado: Temp=... Hum=...
   ```

---

### Paso 4: Levantar el Frontend (Interfaz Web)
1. Abre una segunda terminal en la raíz del proyecto:
   ```bash
   cd "c:\xampp\htdocs\ENCUBADORA DE HUEVO-ARDUINO"
   ```
2. Instala las dependencias (si es la primera vez):
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
4. Verás en consola:
   ```text
   VITE v8.2.2  ready in ... ms
   ➜  Local:   http://localhost:8080/
   ```
5. Abre en tu navegador: [http://localhost:8080](http://localhost:8080) e inicia sesión con `admin@admin.com` y `admin123`.

---

## ⚡ 5. Inicio Rápido con Scripts de 1-Clic

Para tu comodidad, se incluyen scripts que inician el backend y el frontend automáticamente en ventanas independientes:

- **Doble clic en:** `iniciar_sistema.bat`
- O desde PowerShell:
  ```powershell
  .\iniciar_sistema.bat
  ```

---

## 🔧 6. Solución de Problemas Frecuentes

### ❌ Error: "ECONNREFUSED 127.0.0.1:3306"
- **Causa:** El servicio MySQL de XAMPP no está encendido.
- **Solución:** Abre XAMPP Control Panel y pulsa **Start** en MySQL.

### ❌ Contraseña de administrador no funciona
- Ejecuta el script de reseteo:
  ```bash
  cd backend
  node reset-admin.js
  ```
  Esto restablece la contraseña de `admin@admin.com` a `admin123`.

### ❌ El puerto 3001 o 8080 ya está en uso
- En PowerShell, para encontrar y cerrar procesos ocupando el puerto:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force
  ```

### ❌ Las lecturas de temperatura y humedad no se actualizan
- Verifica tu conexión a internet, ya que el backend consulta la API pública de ThingSpeak cada 60 segundos (`https://api.thingspeak.com/channels/3442278/feeds.json`).
- Si cambiaste el canal de ThingSpeak, actualiza las constantes `THINGSPEAK_CHANNEL_ID` y `THINGSPEAK_API_KEY` dentro de `backend/index.js`.
