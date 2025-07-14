import { Module } from "@nestjs/common";
import { SimpleCacheService } from "./simple-cache.service";

@Module({
  providers: [SimpleCacheService],
  exports: [SimpleCacheService],
})
export class SimpleCacheModule {}
