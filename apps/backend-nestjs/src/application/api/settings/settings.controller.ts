import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { AuthGuard } from '../../guards/auth.guard';

@ApiTags('settings')
@Controller('settings')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get application settings' })
  @ApiResponse({ status: 200, description: 'Application settings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSettings(): Promise<any> {
    return this.settingsService.getSettings();
  }

  @Post()
  @ApiOperation({ summary: 'Update application settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid settings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateSettings(@Body() settings: any): Promise<{ success: boolean; message: string }> {
    await this.settingsService.updateSettings(settings);
    return {
      success: true,
      message: 'Settings updated successfully',
    };
  }
}
