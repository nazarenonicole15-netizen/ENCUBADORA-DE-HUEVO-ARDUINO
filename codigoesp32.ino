#include <WiFi.h>
#include <WiFiManager.h>
#include <ThingSpeak.h>
#include <DHT.h>

// =========================
// DHT11
// =========================
#define DHTPIN 27
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

// =========================
// LEDS
// =========================
const int LED_ROJO = 25;
const int LED_VERDE = 26;

// =========================
// THINGSPEAK
// =========================
unsigned long channelID = 3442278;
const char* writeAPIKey = "EITBHFT7KA1M9P72";

WiFiClient cliente;


// =====================================================
// PARPADEAR LED
// =====================================================
void parpadearLED(int pin, int veces, int tiempoEncendido, int tiempoApagado)
{
  for (int i = 0; i < veces; i++)
  {
    digitalWrite(pin, HIGH);
    delay(tiempoEncendido);

    digitalWrite(pin, LOW);
    delay(tiempoApagado);
  }
}


// =====================================================
// CONECTAR WIFI CON WIFIMANAGER
// =====================================================
void conectarWiFi()
{
  WiFiManager wifiManager;

  Serial.println();
  Serial.println("=================================");
  Serial.println("      WIFI MANAGER ESP32");
  Serial.println("=================================");

  // Nombre del punto de acceso que creará el ESP32
  // si no puede conectarse a una red conocida.
  //
  // El segundo parámetro es la contraseña del AP.
  // Debe tener al menos 8 caracteres.
  //
  // Ejemplo:
  // AP: ESP32-DHT11
  // CLAVE: 12345678

  wifiManager.setConfigPortalTimeout(180);

  if (!wifiManager.autoConnect("ESP32-DHT11", "12345678"))
  {
    Serial.println();
    Serial.println("No se pudo conectar al WiFi.");
    Serial.println("Reiniciando ESP32...");

    delay(3000);
    ESP.restart();
  }

  Serial.println();
  Serial.println("=================================");
  Serial.println("     WIFI CONECTADO");
  Serial.println("=================================");

  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  Serial.print("Direccion IP: ");
  Serial.println(WiFi.localIP());

  Serial.print("RSSI: ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");

  Serial.println("=================================");
}


// =====================================================
// SETUP
// =====================================================
void setup()
{
  Serial.begin(115200);
  delay(1500);

  // =========================
  // CONFIGURAR LEDS
  // =========================
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);

  digitalWrite(LED_ROJO, LOW);
  digitalWrite(LED_VERDE, LOW);

  // =========================
  // INICIAR DHT11
  // =========================
  dht.begin();

  // =========================
  // CONECTAR WIFI
  // =========================
  conectarWiFi();

  // =========================
  // INICIAR THINGSPEAK
  // =========================
  ThingSpeak.begin(cliente);

  Serial.println("ThingSpeak iniciado.");
  Serial.println();
}


// =====================================================
// LOOP
// =====================================================
void loop()
{
  // ===================================================
  // DOS PARPADEOS ROJOS
  // Indican que se realizará una lectura
  // ===================================================
  parpadearLED(LED_ROJO, 2, 250, 200);


  // ===================================================
  // LEER DHT11
  // ===================================================
  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();


  // ===================================================
  // VERIFICAR SENSOR
  // ===================================================
  if (isnan(temperatura) || isnan(humedad))
  {
    Serial.println("Error al leer el sensor DHT11");

    // Cuatro parpadeos rojos
    parpadearLED(LED_ROJO, 4, 200, 200);

    delay(2000);

    return;
  }


  // ===================================================
  // MOSTRAR DATOS
  // ===================================================
  Serial.print("Temperatura: ");
  Serial.print(temperatura, 1);
  Serial.println(" C");

  Serial.print("Humedad: ");
  Serial.print(humedad, 1);
  Serial.println(" %");


  // ===================================================
  // VERIFICAR WIFI
  // ===================================================
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println();
    Serial.println("WiFi desconectado.");
    Serial.println("Intentando reconectar...");

    WiFi.reconnect();

    unsigned long tiempoInicio = millis();

    while (WiFi.status() != WL_CONNECTED &&
           millis() - tiempoInicio < 10000)
    {
      delay(500);
      Serial.print(".");
    }

    Serial.println();

    // Si sigue sin conexión
    if (WiFi.status() != WL_CONNECTED)
    {
      Serial.println("No se pudo reconectar.");

      Serial.println("Iniciando WiFiManager...");

      conectarWiFi();
    }
  }


  // ===================================================
  // ENVIAR DATOS A THINGSPEAK
  // ===================================================
  ThingSpeak.setField(1, temperatura);
  ThingSpeak.setField(2, humedad);

  int respuesta = ThingSpeak.writeFields(
    channelID,
    writeAPIKey
  );


  // ===================================================
  // VERIFICAR ENVÍO
  // ===================================================
  if (respuesta == 200)
  {
    Serial.println("Datos enviados correctamente a ThingSpeak");

    // LED verde durante 2 segundos
    digitalWrite(LED_VERDE, HIGH);
    delay(2000);
    digitalWrite(LED_VERDE, LOW);
  }
  else
  {
    Serial.print("Error al enviar. Codigo: ");
    Serial.println(respuesta);

    // Cinco parpadeos rojos rápidos
    parpadearLED(LED_ROJO, 5, 100, 100);
  }


  Serial.println("-----------------------------");


  // ===================================================
  // ESPERAR 20 SEGUNDOS
  // ===================================================
  delay(20000);
}
