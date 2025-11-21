import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login', description: 'Authenticate user with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseDto<unknown>> {
    const result = await this.authService.login(loginDto);
    return new ApiResponseDto(HttpStatus.OK, 'Login successful', result);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user', description: 'Create a new user account (default role: user)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(@Body() createUserDto: CreateUserDto): Promise<ApiResponseDto<unknown>> {
    const user = await this.usersService.create(createUserDto);
    const { password, ...userWithoutPassword } = user.toObject();
    return new ApiResponseDto(HttpStatus.CREATED, 'User registered successfully', userWithoutPassword);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile', description: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: UserDocument): Promise<ApiResponseDto<unknown>> {
    const { password, ...userWithoutPassword } = user.toObject();
    return new ApiResponseDto(HttpStatus.OK, 'Profile retrieved successfully', userWithoutPassword);
  }

  @Post('register-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register admin user', description: 'Create a new admin user (requires super_admin role)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Admin user created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super admin role required' })
  async registerAdmin(@Body() createUserDto: CreateUserDto): Promise<ApiResponseDto<unknown>> {
    const user = await this.usersService.create(createUserDto);
    const { password, ...userWithoutPassword } = user.toObject();
    return new ApiResponseDto(HttpStatus.CREATED, 'Admin user created successfully', userWithoutPassword);
  }
}

