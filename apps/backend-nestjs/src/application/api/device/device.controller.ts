import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { AuthGuard } from '../../guards/auth.guard';
import { DeviceActionDto } from './dto/device-action.dto';

@ApiTags('devices')
@Controller('devices')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all devices' })
  @ApiResponse({ status: 200, description: 'List of all devices' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllDevices(): Promise<any[]> {
    return this.deviceService.getAllDevices();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get device by ID' })
  @ApiResponse({ status: 200, description: 'Device details' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDevice(@Param('id') id: string): Promise<any> {
    return this.deviceService.getDevice(id);
  }

  @Post(':id/action')
  @ApiOperation({ summary: 'Execute device action' })
  @ApiResponse({ status: 200, description: 'Action executed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid action' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async executeDeviceAction(
    @Param('id') deviceId: string,
    @Body() actionDto: DeviceActionDto
  ): Promise<{ success: boolean; message: string }> {
    await this.deviceService.executeDeviceAction(deviceId, actionDto.entityId, actionDto.action);
    return {
      success: true,
      message: `Device action executed successfully`,
    };
  }
}
