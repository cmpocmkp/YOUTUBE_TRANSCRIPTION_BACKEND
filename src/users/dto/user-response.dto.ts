import { UserRole } from '../schemas/user.schema';

export class UserResponseDto {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

