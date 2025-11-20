import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseDto<unknown>> {
    const result = await this.authService.login(loginDto);
    return new ApiResponseDto(HttpStatus.OK, 'Login successful', result);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<ApiResponseDto<unknown>> {
    const user = await this.usersService.create(createUserDto);
    const { password, ...userWithoutPassword } = user.toObject();
    return new ApiResponseDto(HttpStatus.CREATED, 'User registered successfully', userWithoutPassword);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: UserDocument): Promise<ApiResponseDto<unknown>> {
    const { password, ...userWithoutPassword } = user.toObject();
    return new ApiResponseDto(HttpStatus.OK, 'Profile retrieved successfully', userWithoutPassword);
  }

  @Post('register-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async registerAdmin(@Body() createUserDto: CreateUserDto): Promise<ApiResponseDto<unknown>> {
    const user = await this.usersService.create(createUserDto);
    const { password, ...userWithoutPassword } = user.toObject();
    return new ApiResponseDto(HttpStatus.CREATED, 'Admin user created successfully', userWithoutPassword);
  }
}

