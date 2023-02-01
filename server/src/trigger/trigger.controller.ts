import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Logger,
} from '@nestjs/common'
import { TriggerService } from './trigger.service'
import { CreateTriggerDto } from './dto/create-trigger.dto'
import { ResponseUtil } from 'src/utils/response'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard'
import { ApplicationAuthGuard } from 'src/auth/application.auth.guard'

@ApiTags('Trigger')
@Controller('apps/:appid/triggers')
@ApiBearerAuth('Authorization')
export class TriggerController {
  private readonly logger = new Logger(TriggerController.name)
  constructor(private readonly triggerService: TriggerService) {}

  /**
   * Create a cron trigger
   * @param appid
   * @param dto
   * @returns
   */
  @ApiOperation({ summary: 'Create a cron trigger' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Post()
  async create(@Param('appid') appid: string, @Body() dto: CreateTriggerDto) {
    const res = await this.triggerService.create(appid, dto)
    return ResponseUtil.ok(res)
  }

  /**
   * Get trigger list of an application
   * @param appid
   * @returns
   */
  @ApiOperation({ summary: 'Get trigger list of an application' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get()
  async findAll(@Param('appid') appid: string) {
    const res = await this.triggerService.findAll(appid)
    return ResponseUtil.ok(res)
  }

  /**
   * Delete a cron trigger
   * @param appid
   * @param id
   * @returns
   * @memberof TriggerController
   */
  @ApiOperation({ summary: 'Remove a cron trigger' })
  @ApiResponse({ type: ResponseUtil })
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Delete(':id')
  async remove(@Param('appid') appid: string, @Param('id') id: string) {
    const res = await this.triggerService.remove(appid, id)
    return ResponseUtil.ok(res)
  }
}
