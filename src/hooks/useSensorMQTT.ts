// src/hooks/useSensorMQTT.ts
'use client';

import { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import { MQTT_CONFIG } from '../config/mqtt';

// Định nghĩa kiểu dữ liệu cho biểu đồ
export interface ChartDataPoint {
  time: string;
  value: number;
}

export function useSensorMQTT() {
  const [temperature, setTemperature] = useState<number>(0);
  const [humidity, setHumidity] = useState<number>(0);
  const [light, setLight] = useState<number>(0);
  
  // Logic mới: Lưu trữ mảng dữ liệu cho biểu đồ (Module 4)
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
    });

    mqttClient.on('connect', () => {
      console.log('✅ Connected to Adafruit IO');
      setIsConnected(true);
      setClient(mqttClient);

      const sensorFeeds = [
        MQTT_CONFIG.feeds.temperature,
        MQTT_CONFIG.feeds.humidity,
        MQTT_CONFIG.feeds.light
      ];
      
      sensorFeeds.forEach(feed => {
        mqttClient.subscribe(`${MQTT_CONFIG.username}/feeds/${feed}`);
      });
    });

    mqttClient.on('message', (topic, message) => {
      const value = parseFloat(message.toString());
      const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newPoint = { time: timeLabel, value: value };

      if (topic.includes(MQTT_CONFIG.feeds.temperature)) {
        setTemperature(value);
        setTempHistory(prev => [...prev.slice(-19), newPoint]); // Giữ tối đa 20 điểm dữ liệu
      } 
      else if (topic.includes(MQTT_CONFIG.feeds.humidity)) {
        setHumidity(value);
        setHumiHistory(prev => [...prev.slice(-19), newPoint]);
      } 
      else if (topic.includes(MQTT_CONFIG.feeds.light)) {
        setLight(value);
        setLightHistory(prev => [...prev.slice(-19), newPoint]);
      }
    });

    mqttClient.on('close', () => setIsConnected(false));
    
    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  const toggleDevice = (feedKey: keyof typeof MQTT_CONFIG.feeds, status: 'ON' | 'OFF') => {
    if (client && isConnected) {
      const message = status === 'ON' ? '1' : '0';
      const feedName = MQTT_CONFIG.feeds[feedKey];
      client.publish(`${MQTT_CONFIG.username}/feeds/${feedName}`, message);
      console.log(`📤 Sent ${status} to ${feedName}`);
    }
  };

  // Trả về thêm các mảng History để vẽ biểu đồ
  return { 
    temperature, humidity, light, 
    tempHistory, humiHistory, lightHistory, 
    toggleDevice, isConnected 
  };
}