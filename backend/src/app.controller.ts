import { Controller, Get } from "@nestjs/common";

import { AppService } from "./app.service";
import { DatabaseService } from "./modules/database/database.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("health")
  getHealth(): object {
    return {
      status: "OK",
      timestamp: new Date().toISOString(),
      message: "Application is running successfully",
    };
  }

  @Get("db-test")
  async testDatabase(): Promise<object> {
    const isConnected = await this.databaseService.testConnection();
    const dbInfo = await this.databaseService.getDatabaseInfo();
    
    return {
      connected: isConnected,
      timestamp: new Date().toISOString(),
      databaseInfo: dbInfo,
    };
  }
}
