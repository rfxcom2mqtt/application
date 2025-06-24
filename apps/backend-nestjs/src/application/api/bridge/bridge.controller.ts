import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BridgeService } from '../../../core/bridge/bridge.service';
import { AuthGuard } from '../../guards/auth.guard';
import { BridgeActionDto } from './dto/bridge-action.dto';
import { BridgeInfoClass } from '@rfxcom2mqtt/shared';
import { loggerFactory, LoggerCategories } from '../../../utils/logger';

@ApiTags('bridge')
@Controller('bridge')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class BridgeController {
  private readonly logger = loggerFactory.getLogger(LoggerCategories.API);

  constructor(private readonly bridgeService: BridgeService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get bridge information' })
  @ApiResponse({ status: 200, description: 'Bridge information retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async info(): Promise<BridgeInfoClass> {
    this.logger.info('API request: GET /bridge/info');
    const bridgeInfo = await this.bridgeService.getBridgeInfo();
    this.logger.debug('Bridge info retrieved successfully');
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
    this.logger.info(`API request: POST /bridge/action - action: ${actionDto.action}`);
    
    // Create the Action object expected by the bridge service
    const action = {
      type: 'bridge' as const,
      action: actionDto.action,
    };

    try {
      await this.bridgeService.executeAction(action);
      this.logger.info(`Bridge action '${actionDto.action}' executed successfully`);
      return {
        success: true,
        message: `Bridge action '${actionDto.action}' executed successfully`,
      };
    } catch (error: any) {
      this.logger.error(`Failed to execute bridge action '${actionDto.action}': ${error.message}`);
      throw error;
    }
  }

  @Post('restart')
  @ApiOperation({ summary: 'Restart the bridge' })
  @ApiResponse({ status: 200, description: 'Bridge restart initiated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async restart(): Promise<{ success: boolean; message: string }> {
    this.logger.info('API request: POST /bridge/restart');
    
    try {
      await this.bridgeService.restart();
      this.logger.info('Bridge restart initiated successfully');
      return {
        success: true,
        message: 'Bridge restart initiated',
      };
    } catch (error: any) {
      this.logger.error(`Failed to restart bridge: ${error.message}`);
      throw error;
    }
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop the bridge' })
  @ApiResponse({ status: 200, description: 'Bridge stop initiated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async stop(): Promise<{ success: boolean; message: string }> {
    this.logger.info('API request: POST /bridge/stop');
    
    try {
      await this.bridgeService.stop();
      this.logger.info('Bridge stop initiated successfully');
      return {
        success: true,
        message: 'Bridge stop initiated',
      };
    } catch (error: any) {
      this.logger.error(`Failed to stop bridge: ${error.message}`);
      throw error;
    }
  }
}
