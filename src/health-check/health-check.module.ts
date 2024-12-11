import { Module } from '@nestjs/common';
import { HealthCheckControllerController } from './health-check-controller.controller';

@Module({
  controllers: [HealthCheckControllerController]
})
export class HealthCheckModule {}
