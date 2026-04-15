# Adafruit IO API Documentation

This document explains the technical details of how the SmartHome project communicates with the Adafruit IO server for IoT data exchange.

## 1. Connection Architecture

The application uses the **MQTT Protocol** via WebSockets to maintain a persistent bi-directional connection with Adafruit IO.

- **Broker Host:** `io.adafruit.com` (configured via `NEXT_PUBLIC_ADAFRUIT_HOST`)
- **Port:** `443` (Secure WebSockets)
- **Protocol:** `wss`
- **Authentication:** 
  - **Username:** Your Adafruit Account Username (`NEXT_PUBLIC_ADAFRUIT_USERNAME`)
  - **Password:** Your Adafruit IO Key (`NEXT_PUBLIC_ADAFRUIT_AIO_KEY`)

## 2. Topic Structure

Adafruit IO topics follow a specific hierarchy:
`{username}/feeds/{feed_key}`

### Subscribed Topics (Receiving Data)
The app listens for real-time updates from these feeds:
- `{username}/feeds/bbc-temp`: Temperature sensor updates.
- `{username}/feeds/bbc-humidity`: Humidity sensor updates.
- `{username}/feeds/bbc-light`: Ambient light level updates.

### Published Topics (Sending Commands)
The app sends control signals to these feeds:
- `{username}/feeds/bbc-led`: Controls Smart Lighting.
- `{username}/feeds/bbc-fan`: Controls the Cooling Fan.

---

## 3. Data Format (JSON & Raw)

Although Adafruit IO supports complex JSON via its REST API, the MQTT implementation in this project primarily uses **Raw String Payloads** for efficiency.

### Receiving Sensor Data
When a sensor (like a Micro:bit) sends data, the payload received by the app is a simple string representation of a number.

**Example Message Flow:**
- **Topic:** `nhantruong/feeds/bbc-temp`
- **Payload:** `"28.50"`
- **Logic:** The app parses this string into a JavaScript `Number`.

```json
// Internal app representation after parsing
{
  "id": "abc123",
  "time": "20:30:45",
  "value": 28.5
}
```

### Sending Command Data
To toggle devices, the app publishes a single character string.

- **To Turn ON:** `"1"`
- **To Turn OFF:** `"0"`

**Example Publish Request:**
- **Topic:** `nhantruong/feeds/bbc-led`
- **Payload:** `"1"` (Result: Light turns ON)

---

## 4. REST API Endpoints (Reference)

While the dashboard uses MQTT for real-time data, Adafruit IO also provides a REST API that can be used for debugging or history retrieval.

- **Base URL:** `https://io.adafruit.com/api/v2/`
- **Authentication Header:** `X-AIO-Key: {your_aio_key}`

### Get Latest Feed Data
`GET /{username}/feeds/{feed_key}/data/last`

**Response Format:**
```json
{
  "id": "0ENZ7XQ0XAZR9W8A9H8V2Z7M",
  "value": "25.0",
  "feed_id": 12345,
  "created_at": "2026-04-15T13:45:00Z",
  "lat": null,
  "lon": null,
  "ele": null
}
```

### Create New Data Point
`POST /{username}/feeds/{feed_key}/data`
**Payload:**
```json
{
  "datum": {
    "value": "1"
  }
}
```

---

## 5. Summary Table

| Feature | Protocol | Method | Topic/Endpoint | Payload |
| :--- | :--- | :--- | :--- | :--- |
| **Real-time Monitoring** | MQTT | Subscribe | `{user}/feeds/bbc-*` | Raw numeric string |
| **Device Control** | MQTT | Publish | `{user}/feeds/bbc-led` | `"1"` (ON) or `"0"` (OFF) |
| **Data History** | REST | GET | `/feeds/{key}/data` | JSON array of points |
| **Account Info** | REST | GET | `/user` | JSON user object |

> [!IMPORTANT]
> Ensure your Adafruit IO Feeds are set to **Public** or your **AIO Key** has the necessary permissions to read/write to these topics.
