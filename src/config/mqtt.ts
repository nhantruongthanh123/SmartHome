// src/config/mqtt.ts

export const MQTT_CONFIG = {
  host: process.env.NEXT_PUBLIC_ADAFRUIT_HOST,
  username: process.env.NEXT_PUBLIC_ADAFRUIT_USERNAME,
  apiKey: process.env.NEXT_PUBLIC_ADAFRUIT_AIO_KEY,

  
  feeds: {
    temperature: 'bbc-temp', 
    humidity: 'bbc-humidity',      
    light: 'bbc-light',
    led: 'bbc-led',
    fan: 'bbc-fan'
  }
};