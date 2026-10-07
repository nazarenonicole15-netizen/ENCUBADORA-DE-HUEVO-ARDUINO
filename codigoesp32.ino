#include <WiFi.h>
#include "DHT.h"
#include <HTTPClient.h>

// ---------------------------------------------------------
// CONFIGURACIÓN DE RED WI-FI
// ---------------------------------------------------------
const char* ssid = "TU_NOMBRE_DE_RED_WIFI";      // Reemplaza con el nombre de tu red
const char* password = "TU_CONTRASEÑA_WIFI";     // Reemplaza con tu contraseña

// ---------------------------------------------------------
// CONFIGURACIÓN DE THINGSPEAK
// ---------------------------------------------------------
const char* server = "http://api.thingspeak.com/update";
// IMPORTANTE: Reemplaza con tu WRITE API KEY de tu canal de ThingSpeak (Canal ID: 3442278)
String apiKey = "TU_WRITE_API_KEY_AQUI"; 

// ---------------------------------------------------------
// CONFIGURACIÓN DEL SENSOR DHT
// ---------------------------------------------------------
#define DHTPIN 4          // Pin digital de la placa conectado al pin de datos del sensor DHT (Ej. GPIO 4)
#define DHTTYPE DHT22     // Tipo de sensor: DHT11 o DHT22

DHT dht(DHTPIN, DHTTYPE);

// ---------------------------------------------------------
// TIEMPOS DE ENVÍO
// ---------------------------------------------------------
unsigned long previousMillis = 0;
// ThingSpeak permite 1 petición cada 15 segundos en cuentas gratuitas.
// Lo configuramos a 20 segundos (20000 ms) para asegurar estabilidad.
const long interval = 20000; 

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  // Conexión a la red Wi-Fi
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("Wi-Fi conectado exitosamente!");
  Serial.print("Dirección IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long currentMillis = millis();

  // Ejecutar toma de lectura y envío cada 20 segundos
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    // Lectura de humedad y temperatura
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    // Comprobar si las lecturas fallaron y salir para intentar en el siguiente ciclo
    if (isnan(h) || isnan(t)) {
      Serial.println(F("¡Fallo al leer del sensor DHT! Revisa las conexiones."));
      return;
    }

    Serial.print(F("Humedad: "));
    Serial.print(h);
    Serial.print(F("%  Temperatura: "));
    Serial.print(t);
    Serial.println(F("°C "));

    // Asegurarse de que el Wi-Fi siga conectado antes de hacer la petición
    if(WiFi.status() == WL_CONNECTED){
      HTTPClient http;
      
      // Construir la URL con la API Key y los campos correspondientes a ThingSpeak
      // field1 = Temperatura, field2 = Humedad (tal como espera el backend)
      String url = String(server) + "?api_key=" + apiKey + "&field1=" + String(t) + "&field2=" + String(h);
      
      http.begin(url);
      int httpResponseCode = http.GET();
      
      if (httpResponseCode > 0) {
        Serial.print("Datos enviados a ThingSpeak con éxito. Código HTTP: ");
        Serial.println(httpResponseCode);
      } else {
        Serial.print("Error al enviar datos. Código de error HTTP: ");
        Serial.println(httpResponseCode);
      }
      http.end(); // Liberar recursos
    } else {
      Serial.println("Desconectado de la red Wi-Fi");
      // Intentar reconectar si se pierde la conexión
      WiFi.reconnect();
    }
  }
}
