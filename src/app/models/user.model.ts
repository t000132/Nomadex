export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  createdAt?: string;
  avatar?: string;
  coverPicture?: string;
  additionalInfo?: string
}
