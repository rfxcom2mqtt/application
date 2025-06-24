import { Controller, Get, Res, Req, Next } from '@nestjs/common';
import { Response, Request, NextFunction } from 'express';
import { FrontendService } from './frontend.service';

@Controller()
export class FrontendController {
  constructor(private readonly frontendService: FrontendService) {}

  @Get('*')
  async serveFrontend(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction
  ): Promise<void> {
    // Skip API routes - let them be handled by their controllers
    if (req.path.startsWith('/api')) {
      return next();
    }

    await this.frontendService.serveFrontend(req, res);
  }
}
