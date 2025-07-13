import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async testConnection(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  async getDatabaseInfo(): Promise<any> {
    try {
      const result = await this.dataSource.query('SELECT version()');
      return result[0];
    } catch (error) {
      console.error('Failed to get database info:', error);
      return null;
    }
  }
}