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

  @Get(':id/state')
  @ApiOperation({ summary: 'Get device state' })
  @ApiResponse({ status: 200, description: 'Device state' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDeviceState(@Param('id') id: string): Promise<any[]> {
    return this.deviceService.getDeviceState(id);
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

  @Post(':id/rename')
  @ApiOperation({ summary: 'Rename device' })
  @ApiResponse({ status: 200, description: 'Device renamed successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async renameDevice(
    @Param('id') id: string,
    @Body() body: { name: string }
  ): Promise<{ success: boolean; message: string }> {
    await this.deviceService.renameDevice(id, body.name);
    return {
      success: true,
      message: `Device renamed successfully`,
    };
  }

  @Post(':id/switch/:itemId/rename')
  @ApiOperation({ summary: 'Rename device switch unit' })
  @ApiResponse({ status: 200, description: 'Switch unit renamed successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async renameSwitchUnit(
    @Param('id') deviceId: string,
    @Param('itemId') itemId: string,
    @Body() body: { name: string; unitCode: number }
  ): Promise<{ success: boolean; message: string }> {
    await this.deviceService.renameSwitchUnit(deviceId, itemId, body.name, body.unitCode);
    return {
      success: true,
      message: `Switch unit renamed successfully`,
    };
  }
}
