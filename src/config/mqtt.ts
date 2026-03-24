// src/config/mqtt.ts

export const MQTT_CONFIG = {
  // Đọc trực tiếp từ file .env qua biến môi trường của Next.js
  host: process.env.NEXT_PUBLIC_ADAFRUIT_HOST,
  username: process.env.NEXT_PUBLIC_ADAFRUIT_USERNAME,
  apiKey: process.env.NEXT_PUBLIC_ADAFRUIT_AIO_KEY,

  // Định nghĩa tên các Feed (Khớp với trên Adafruit của bạn)
  feeds: {
    temperature: 'bbc-temperature', 
    humidity: 'bbc-humidity',      
    light: 'bbc-light',
    led: 'bbc-led',
    fan: 'bbc-fan'
  }
};