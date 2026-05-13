'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import mqtt from 'mqtt';
import { MQTT_CONFIG } from '../config/mqtt';

import { ChartDataPoint, SensorData } from '../types/sensor';

export function useSensorMQTT() {
  const [temperature, setTemperature] = useState<SensorData>({ value: 0, lastUpdated: null });
  const [humidity, setHumidity] = useState<SensorData>({ value: 0, lastUpdated: null });
  const [light, setLight] = useState<SensorData>({ value: 0, lastUpdated: null });

  // States for device synchronization (two-way)
  const [ledStatus, setLedStatus] = useState<boolean>(false);
  const [fanStatus, setFanStatus] = useState<boolean>(false);
  const [pumpStatus, setPumpStatus] = useState<boolean>(false);
  const [doorStatus, setDoorStatus] = useState<boolean>(false);
  const [motionStatus, setMotionStatus] = useState<boolean>(false);
  const [doorTimer, setDoorTimer] = useState<number>(0);

  const [tempHistory, setTempHistory] = useState<ChartDataPoint[]>([]);
  const [humiHistory, setHumiHistory] = useState<ChartDataPoint[]>([]);
  const [lightHistory, setLightHistory] = useState<ChartDataPoint[]>([]);

  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const motionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoggedStatusRef = useRef<boolean | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const toggleDevice = useCallback((feedKey: string, status: 'ON' | 'OFF') => {
    const mqttClient = clientRef.current;
    if (!mqttClient || !isConnected || !MQTT_CONFIG.username) return;

    const mappedFeed = MQTT_CONFIG.feeds[feedKey as keyof typeof MQTT_CONFIG.feeds] ?? feedKey;
    const message = status === 'ON' ? '1' : '0';
    mqttClient.publish(`${MQTT_CONFIG.username}/feeds/${mappedFeed}`, message);
  }, [isConnected]);

  // --- REST API: Fetch Initial Data & History ---
  useEffect(() => {
    const fetchInitialData = async () => {
      const { username, apiKey } = MQTT_CONFIG;
      if (!username || !apiKey) return;

      const sensorFeeds = [
        { key: 'bbc-temp', setter: setTemperature, historySetter: setTempHistory },
        { key: 'bbc-humidity', setter: setHumidity, historySetter: setHumiHistory },
        { key: 'bbc-light', setter: setLight, historySetter: setLightHistory }
      ];

      for (const feed of sensorFeeds) {
        try {
          // 1. Fetch last 20 points for charts
          const historyRes = await fetch(
            `https://io.adafruit.com/api/v2/${username}/feeds/${feed.key}/data?limit=20`,
            { headers: { 'X-AIO-Key': apiKey } }
          );
          if (historyRes.ok) {
            const data = await historyRes.json();
            const points: ChartDataPoint[] = data.reverse().map((item: any) => ({
              id: item.id,
              time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              value: parseFloat(item.value)
            }));
            feed.historySetter(points);

            // 2. Set current value from the latest point
            if (points.length > 0) {
              const latest = data[data.length - 1]; // data is reversed now, so last item is newest
              feed.setter({
                value: parseFloat(latest.value),
                lastUpdated: new Date(latest.created_at)
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching history for ${feed.key}:`, err);
        }
      }
    };

    const fetchInitialDeviceStats = async () => {
      const { username, apiKey } = MQTT_CONFIG;
      if (!username || !apiKey) return;

      const deviceFeeds = [
        { key: 'bbc-led', setter: setLedStatus },
        { key: 'bbc-fan', setter: setFanStatus },
        { key: 'bbc-pump', setter: setPumpStatus },
        { key: 'bbc-door', setter: setDoorStatus },
        { key: 'bbc-motion', setter: setMotionStatus }
      ];

      for (const feed of deviceFeeds) {
        try {
          const res = await fetch(
            `https://io.adafruit.com/api/v2/${username}/feeds/${feed.key}/data/last`,
            { headers: { 'X-AIO-Key': apiKey } }
          );
          if (res.ok) {
            const data = await res.json();
            feed.setter(data.value === '1');
          }
        } catch (err) {
          console.error(`Error fetching last value for ${feed.key}:`, err);
        }
      }
    };

    fetchInitialData();
    fetchInitialDeviceStats();
  }, []);

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

    console.log('🔌 Connecting to MQTT...');

    mqttClient.on('connect', () => {
      setIsConnected(true);
      clientRef.current = mqttClient;

      const feedsToSubscribe = ['bbc-temp', 'bbc-humidity', 'bbc-light', 'bbc-led', 'bbc-fan', 'bbc-pump', 'bbc-door', 'bbc-motion'];
      feedsToSubscribe.forEach(feed => {
        const topic = `${MQTT_CONFIG.username}/feeds/${feed}`;
        mqttClient.subscribe(topic);
      });
    });

    mqttClient.on('message', (topic, message) => {
      const value = Number(parseFloat(message.toString()).toFixed(2));
      const now = new Date();
      const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const uniqueId = Math.random().toString(36).substring(7);
      const newPoint: ChartDataPoint = { id: uniqueId, time: timeLabel, value: value };

      if (topic.includes('bbc-temp')) {
        setTemperature({ value, lastUpdated: now });
        setTempHistory(prev => [...prev.slice(-19), newPoint]);

        // Cập nhật lên màn hình LCD
        const lcdTopic = `${MQTT_CONFIG.username}/feeds/${MQTT_CONFIG.feeds.lcd}`;
        mqttClient.publish(lcdTopic, `Temp: ${value} C`);
      }
      else if (topic.includes('bbc-humidity')) {
        setHumidity({ value, lastUpdated: now });
        setHumiHistory(prev => [...prev.slice(-19), newPoint]);
      }
      else if (topic.includes('bbc-light')) {
        setLight({ value, lastUpdated: now });
        setLightHistory(prev => [...prev.slice(-19), newPoint]);
      }
      // Update Device Status Feedback
      else if (topic.includes('bbc-led')) {
        setLedStatus(message.toString() === '1');
      }
      else if (topic.includes('bbc-fan')) {
        setFanStatus(message.toString() === '1');
      }
      else if (topic.includes('bbc-pump')) {
        setPumpStatus(message.toString() === '1');
      }
      else if (topic.includes('bbc-door')) {
        setDoorStatus(message.toString() === '1');
      }
      else if (topic.includes('bbc-motion')) {
        setMotionStatus(message.toString() === '1');
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

  // --- Automation Logic: Motion -> Door ---
  useEffect(() => {
    if (!isConnected) return;

    if (motionStatus) {
      // Motion Detected -> Open door immediately
      toggleDevice('door', 'ON');
      setDoorTimer(0);
      if (motionTimeoutRef.current) {
        clearTimeout(motionTimeoutRef.current);
        motionTimeoutRef.current = null;
      }
    } else {
      // Motion Stopped -> Start 5s countdown
      setDoorTimer(5);
      if (motionTimeoutRef.current) clearTimeout(motionTimeoutRef.current);

      motionTimeoutRef.current = setTimeout(() => {
        toggleDevice('door', 'OFF');
        setDoorTimer(0);
        motionTimeoutRef.current = null;
      }, 5000);

      // UI Countdown sync
      let timeLeft = 5;
      const interval = setInterval(() => {
        timeLeft -= 1;
        setDoorTimer(timeLeft);
        if (timeLeft <= 0) clearInterval(interval);
      }, 1000);

      return () => {
        clearInterval(interval);
        if (motionTimeoutRef.current) {
          clearTimeout(motionTimeoutRef.current);
          motionTimeoutRef.current = null;
        }
      };
    }
  }, [motionStatus, isConnected, toggleDevice]);

  return {
    temperature: temperature.value,
    tempUpdatedAt: temperature.lastUpdated,
    humidity: humidity.value,
    humiUpdatedAt: humidity.lastUpdated,
    light: light.value,
    lightUpdatedAt: light.lastUpdated,
    tempHistory, humiHistory, lightHistory,
    ledStatus, fanStatus, pumpStatus, doorStatus, motionStatus, doorTimer,
    toggleDevice, isConnected
  };
}