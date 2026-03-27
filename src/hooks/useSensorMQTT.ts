// src/hooks/useSensorMQTT.ts
'use client';

import { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import { MQTT_CONFIG } from '../config/mqtt';

// Định nghĩa kiểu dữ liệu cho biểu đồ
export interface ChartDataPoint {
  id: string;
  time: string;
  value: number;
}

export function useSensorMQTT() {
  const [temperature, setTemperature] = useState<number>(0);
  const [humidity, setHumidity] = useState<number>(0);
  const [light, setLight] = useState<number>(0);
  
  // Lưu trữ mảng dữ liệu cho biểu đồ (Module 4)
  const [tempHistory, setTempHistory] = useState<ChartDataPoint[]>([]);
  const [humiHistory, setHumiHistory] = useState<ChartDataPoint[]>([]);
  const [lightHistory, setLightHistory] = useState<ChartDataPoint[]>([]);

  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_CONFIG.host!, {
      username: MQTT_CONFIG.username!,
      password: MQTT_CONFIG.apiKey!,
      clientId: `nextjs_client_${Math.random().toString(16).slice(3)}`,
      clean: true, 
    });

    mqttClient.on('connect', () => {
      console.log('✅ Connected to Adafruit IO');
      setIsConnected(true);
      setClient(mqttClient);

      // Vì bạn đã chuẩn hóa tên, mình subscribe trực tiếp luôn
      const sensorFeeds = [
        'bbc-temp',
        'bbc-humidity',
        'bbc-light' // Nhớ tạo feed này trên Adafruit nếu bạn muốn đo ánh sáng nhé
      ];
      
      sensorFeeds.forEach(feed => {
        const topic = `${MQTT_CONFIG.username}/feeds/${feed}`;
        mqttClient.subscribe(topic);
        console.log(`📡 Subscribed to: ${topic}`);
      });
    });

    mqttClient.on('message', (topic, message) => {
      // 1. Ép kiểu và làm tròn 2 chữ số thập phân
      const value = Number(parseFloat(message.toString()).toFixed(2));
      
      // 2. Tạo dữ liệu để vẽ biểu đồ
      const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const uniqueId = Math.random().toString(36).substring(7);
      const newPoint: ChartDataPoint = { id: uniqueId, time: timeLabel, value: value };

      console.log(`📩 Có dữ liệu mới từ [${topic}]: ${value}`);

      // 3. Phân loại và cập nhật (Bao gồm cả số hiện tại và mảng biểu đồ)
      // Dùng .includes() bây giờ cực kỳ an toàn vì tên đã được chuẩn hóa
      if (topic.includes('bbc-temp')) {
        setTemperature(value);
        setTempHistory(prev => [...prev.slice(-19), newPoint]); // Giữ 20 điểm
      } 
      else if (topic.includes('bbc-humidity')) {
        setHumidity(value);
        setHumiHistory(prev => [...prev.slice(-19), newPoint]); // Giữ 20 điểm
      } 
      else if (topic.includes('bbc-light')) {
        setLight(value);
        setLightHistory(prev => [...prev.slice(-19), newPoint]); // Giữ 20 điểm
      }
    });

    mqttClient.on('error', (err) => {
      console.error('❌ MQTT Error:', err);
    });

    mqttClient.on('close', () => setIsConnected(false));
    
    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  // Hàm điều khiển thiết bị
  const toggleDevice = (feedKey: string, status: 'ON' | 'OFF') => {
    if (client && isConnected) {
      const message = status === 'ON' ? '1' : '0';
      // Gọi thẳng tên feed mới chuẩn hóa của bạn
      client.publish(`${MQTT_CONFIG.username}/feeds/${feedKey}`, message);
      console.log(`📤 Sent ${status} (${message}) to ${feedKey}`);
    }
  };

  return { 
    temperature, humidity, light, 
    tempHistory, humiHistory, lightHistory, 
    toggleDevice, isConnected 
  };
}