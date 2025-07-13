import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/users.service';
import { Role } from '../src/modules/auth/enums/role.enum';

async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    // Check if admin already exists
    const existingAdmin = await usersService.findByEmail('admin@example.com');
    
    if (existingAdmin) {
      console.log('Admin user already exists with email: admin@example.com');
      await app.close();
      return;
    }

    // Create admin user
    const adminUser = await usersService.create({
      email: 'admin@example.com',
      password: 'admin123456',
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    });

    console.log('Admin user created successfully:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123456');
    console.log('Role: admin');
    console.log('User ID:', adminUser.id);
    
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    await app.close();
  }
}

createAdmin();