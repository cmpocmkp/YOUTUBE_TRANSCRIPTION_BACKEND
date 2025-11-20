import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';

async function seedSuperAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    // Check if super admin already exists
    const existingUser = await usersService.findByEmail('CMPO');
    
    if (existingUser) {
      // Update existing user to super_admin
      await usersService.update(existingUser._id.toString(), {
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      });
      console.log('✅ Super admin user updated successfully!');
      console.log('Email: CMPO');
      console.log('Role: super_admin');
    } else {
      // Create new super admin user
      await usersService.create({
        email: 'CMPO',
        password: 'Cmpo123@#$',
        name: 'CMPO Super Admin',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      });
      console.log('✅ Super admin user created successfully!');
      console.log('Email: CMPO');
      console.log('Password: Cmpo123@#$');
      console.log('Role: super_admin');
    }
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seedSuperAdmin()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

