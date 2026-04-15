export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
