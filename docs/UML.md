# Diagramas UML — Incubadora ESP32

**Última actualización:** 6 de octubre de 2026

---

## 1. Diagrama de Componentes

```mermaid
classDiagram
  class ESP32 {
    +DHT11 sensor (GPIO 27)
    +LED Verde (GPIO 26)
    +LED Rojo (GPIO 25)
    +WiFiManager
    +sendToThingSpeak() cada 20s
  }
  class ThingSpeak {
    +channelID: 3442278
    +field1: temperatura
    +field2: humedad
    +GET feeds.json
  }
  class WorkerNode {
    +setInterval(60000ms)
    +fetchThingSpeakData()
    +INSERT IGNORE readings
  }
  class ExpressAPI {
    +POST /api/login
    +GET /api/users
    +POST /api/users
    +PUT /api/users/:id
    +DELETE /api/users/:id
    +GET /api/settings
    +POST /api/settings
    +POST /api/settings/start
    +POST /api/settings/stop
    +GET /api/readings
    +GET /api/readings/latest
  }
  class MySQLDB {
    +table: users
    +table: settings
    +table: readings
    +execute(sql, params)
  }
  class VueSPA {
    +Login.vue
    +Dashboard.vue
    +AdminUsers.vue
    +router.js (guardias JWT)
    +main.js (interceptor 401)
  }

  ESP32 -->|HTTPS POST cada 20s| ThingSpeak
  ThingSpeak -->|feeds.json| WorkerNode
  WorkerNode -->|INSERT IGNORE| MySQLDB
  WorkerNode --> ExpressAPI : embebido
  ExpressAPI -->|mysql2| MySQLDB
  VueSPA -->|Axios + Bearer JWT| ExpressAPI
```

---

## 2. Modelo de Dominio

```mermaid
classDiagram
  class User {
    +int id
    +string nombre
    +string email
    +string passwordHash
    +Role role
    +datetime created_at
    +canEdit()
    +canDelete()
  }
  class Settings {
    +int id = 1
    +decimal temp_min
    +decimal temp_max
    +decimal hum_min
    +decimal hum_max
    +datetime start_date
    +BirdType bird_type
    +startCycle(type)
    +stopCycle()
    +getIncubationDay()
  }
  class Reading {
    +int id
    +decimal temperatura
    +decimal humedad
    +datetime timestamp
    +datetime created_at
    +isOutOfRange(settings)
    +isStale(minutes)
  }
  class Role {
    <<enumeration>>
    ADMIN
    CLIENTE
  }
  class BirdType {
    <<enumeration>>
    gallina
    codorniz
    ganso
    pavo
    pato
  }

  User --> Role
  Settings --> BirdType
  Settings ..> Reading : define límites para evaluar
```

---

## 3. Secuencia: Ciclo Completo de una Lectura

```mermaid
sequenceDiagram
  participant ESP as ESP32 + DHT11
  participant TS as ThingSpeak
  participant W as Worker (Node.js)
  participant DB as MySQL
  participant FE as Vue Dashboard

  ESP->>TS: ThingSpeak.writeFields(temp, hum)
  TS-->>ESP: HTTP 200 (entry_id)

  Note over W: Cada 60 segundos
  W->>TS: GET feeds.json?results=1&api_key=...
  TS-->>W: {field1: temp, field2: hum, created_at}
  W->>DB: INSERT IGNORE INTO readings (temp, hum, timestamp)
  DB-->>W: OK (1 fila) ó 0 (duplicado ignorado)

  Note over FE: Cada 60 segundos (setInterval)
  FE->>W: GET /api/readings/latest  [Authorization: Bearer JWT]
  W->>DB: SELECT * FROM readings ORDER BY timestamp DESC LIMIT 1
  DB-->>W: {temperatura, humedad, timestamp}
  W-->>FE: JSON
  FE->>FE: Calcula isEspOnline = (now - timestamp) <= 180000ms
  FE->>FE: Calcula tempError / humError vs settings
  alt Fuera de rango
    FE->>FE: Muestra ring rojo + reproduce alarma sonora
  end
```

---

## 4. Secuencia: Autenticación

```mermaid
sequenceDiagram
  participant U as Usuario
  participant F as Login.vue
  participant A as API Express
  participant D as MySQL

  U->>F: Ingresa email y contraseña
  F->>A: POST /api/login { email, password }
  A->>D: SELECT * FROM users WHERE email = ?
  D-->>A: { id, nombre, email, passwordHash, role }
  A->>A: bcrypt.compare(password, passwordHash)
  alt Contraseña correcta
    A->>A: jwt.sign({ id, role, nombre }, secret, 24h)
    A-->>F: { token, user }
    F->>F: localStorage.setItem('token', token)
    F->>F: localStorage.setItem('user', user)
    F-->>U: Redirige a /dashboard
  else Contraseña incorrecta
    A-->>F: HTTP 401 { error: 'Credenciales inválidas' }
    F-->>U: Muestra mensaje de error
  end
```

---

## 5. Secuencia: Editar Usuario (Modal)

```mermaid
sequenceDiagram
  participant Admin as Administrador
  participant FE as AdminUsers.vue
  participant API as Express API
  participant DB as MySQL

  Admin->>FE: Clic en "Editar" (fila de usuario)
  FE->>FE: openEditModal(user) → copia datos, password=""
  FE-->>Admin: Muestra modal con campos prellenados

  Admin->>FE: Modifica nombre / email / rol / contraseña (opcional)
  Admin->>FE: Clic "Guardar Cambios"
  FE->>API: PUT /api/users/:id { nombre, email, role, password }

  alt Con nueva contraseña
    API->>API: bcrypt.hash(password, 10)
    API->>DB: UPDATE users SET nombre,email,password,role WHERE id=?
  else Sin contraseña (campo vacío)
    API->>DB: UPDATE users SET nombre,email,role WHERE id=?
  end

  DB-->>API: OK
  API-->>FE: { message: 'Usuario actualizado' }
  FE->>FE: showEditModal = false; fetchUsers()
  FE-->>Admin: Tabla actualizada
```
