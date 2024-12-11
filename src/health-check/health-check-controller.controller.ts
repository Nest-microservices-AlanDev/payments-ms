import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class HealthCheckControllerController {
  @Get()
  healthCheck() {
    return 'Payments is up and running';
  }
}
 