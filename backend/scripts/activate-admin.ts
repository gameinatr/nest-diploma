import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/modules/auth/entities/user.entity';
import { Repository } from 'typeorm';

async function activateAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  try {
    // Find admin user by email
    const adminUser = await userRepository.findOne({
      where: { email: 'admin@example.com' }
    });
    
    if (!adminUser) {
      console.log('Admin user not found with email: admin@example.com');
      await app.close();
      return;
    }

    if (adminUser.isActive) {
      console.log('Admin user is already active');
      await app.close();
      return;
    }

    // Activate the admin user
    adminUser.isActive = true;
    await userRepository.save(adminUser);

    console.log('Admin user activated successfully:');
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Active:', adminUser.isActive);
    
  } catch (error) {
    console.error('Error activating admin user:', error.message);
  } finally {
    await app.close();
  }
}

activateAdmin();