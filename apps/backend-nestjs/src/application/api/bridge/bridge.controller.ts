import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BridgeService } from './bridge.service';
import { AuthGuard } from '../../guards/auth.guard';
import { BridgeActionDto } from './dto/bridge-action.dto';
import { BridgeInfoClass } from '@rfxcom2mqtt/shared';

@ApiTags('bridge')
@Controller('bridge')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class BridgeController {
  constructor(private readonly bridgeService: BridgeService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get bridge information' })
  @ApiResponse({ status: 200, description: 'Bridge information retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async info(): Promise<BridgeInfoClass> {
    const bridgeInfo = await this.bridgeService.info();
    return bridgeInfo;
  }

  @Post('action')
  @ApiOperation({ summary: 'Execute bridge action' })
  @ApiResponse({ status: 200, description: 'Action executed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid action' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async executeAction(
    @Body() actionDto: BridgeActionDto
  ): Promise<{ success: boolean; message: string }> {
    await this.bridgeService.executeAction(actionDto.action);
    return {
      success: true,
      message: `Bridge action '${actionDto.action}' executed successfully`,
    };
  }

  @Post('restart')
  @ApiOperation({ summary: 'Restart the bridge' })
  @ApiResponse({ status: 200, description: 'Bridge restart initiated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async restart(): Promise<{ success: boolean; message: string }> {
    await this.bridgeService.restart();
    return {
      success: true,
      message: 'Bridge restart initiated',
    };
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop the bridge' })
  @ApiResponse({ status: 200, description: 'Bridge stop initiated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async stop(): Promise<{ success: boolean; message: string }> {
    await this.bridgeService.stop();
    return {
      success: true,
      message: 'Bridge stop initiated',
    };
  }
}
