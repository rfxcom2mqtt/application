import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'RFXCOM2MQTT NestJS Backend is running!';
  }

  getHealth(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'rfxcom2mqtt-nestjs',
      version: '1.0.0',
    };
  }
}
