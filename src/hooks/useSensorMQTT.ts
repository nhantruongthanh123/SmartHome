'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!MQTT_CONFIG.host || !MQTT_CONFIG.username || !MQTT_CONFIG.apiKey) {
      console.error('Missing MQTT environment variables. Check NEXT_PUBLIC_ADAFRUIT_* values.');
      return;
    }

    const mqttClient = mqtt.connect(MQTT_CONFIG.host!, {
      username: MQTT_CONFIG.username!,
      password: MQTT_CONFIG.apiKey!,
      clientId: `nextjs_client_${Math.random().toString(16).slice(3)}`,
      clean: true,
      reconnectPeriod: 3000,
    });

    console.log('🔌 Đang kết nối MQTT...');

    mqttClient.on('connect', () => {
      setIsConnected(true);
      clientRef.current = mqttClient;

      const sensorFeeds = [
        'bbc-temp',
        'bbc-humidity',
        'bbc-light' 
      ];
      
      sensorFeeds.forEach(feed => {
        const topic = `${MQTT_CONFIG.username}/feeds/${feed}`;
        mqttClient.subscribe(topic);
        console.log(`📡 Subscribed to: ${topic}`);
      });
    });

    mqttClient.on('message', (topic, message) => {
      const value = Number(parseFloat(message.toString()).toFixed(2));
      

      const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const uniqueId = Math.random().toString(36).substring(7);
      const newPoint: ChartDataPoint = { id: uniqueId, time: timeLabel, value: value };

      console.log(`📩 Có dữ liệu mới từ [${topic}]: ${value}`);

      if (topic.includes('bbc-temp')) {
        setTemperature(value);
        setTempHistory(prev => [...prev.slice(-19), newPoint]);
      } 
      else if (topic.includes('bbc-humidity')) {
        setHumidity(value);
        setHumiHistory(prev => [...prev.slice(-19), newPoint]); 
      } 
      else if (topic.includes('bbc-light')) {
        setLight(value);
        setLightHistory(prev => [...prev.slice(-19), newPoint]); 
      }
    });

    mqttClient.on('error', (err) => {
      console.error('❌ MQTT Error:', err);
    });

    mqttClient.on('close', () => {
      setIsConnected(false);
      clientRef.current = null;
    });
    
    return () => {
      mqttClient.removeAllListeners();
      mqttClient.end(true);
      clientRef.current = null;
      setIsConnected(false);
    };
  }, []);

  const toggleDevice = useCallback((feedKey: string, status: 'ON' | 'OFF') => {
    const mqttClient = clientRef.current;
    if (!mqttClient || !isConnected || !MQTT_CONFIG.username) return;

    const mappedFeed = MQTT_CONFIG.feeds[feedKey as keyof typeof MQTT_CONFIG.feeds] ?? feedKey;
    const message = status === 'ON' ? '1' : '0';
    mqttClient.publish(`${MQTT_CONFIG.username}/feeds/${mappedFeed}`, message);
  }, [isConnected]);

  return { 
    temperature, humidity, light, 
    tempHistory, humiHistory, lightHistory, 
    toggleDevice, isConnected 
  };
}