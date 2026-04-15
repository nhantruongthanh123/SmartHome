export type DeviceType = 'TEMPERATURE' | 'LIGHT' | 'HUMIDITY';

export interface Threshold {
  id?: string;
  userId: string;
  deviceType: DeviceType | string;
  minVal: number | null;
  maxVal: number | null;
  isActive: boolean;
  updatedAt?: string | Date;
}
