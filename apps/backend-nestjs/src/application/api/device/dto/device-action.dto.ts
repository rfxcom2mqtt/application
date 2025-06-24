import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export interface DeviceActionDto {
  entityId: string;
  action: string;
}
