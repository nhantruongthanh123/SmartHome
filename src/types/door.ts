export interface DoorLog {
  id: string;
  userId: string;
  openedAt: string | Date;
  closedAt: string | Date | null;
  duration: number | null;
}
