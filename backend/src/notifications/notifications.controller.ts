import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.notificationsService.findAllForUser(req.user.userId);
  }

  @Patch('read-all')
  markAllRead(@Req() req: any) {
    return this.notificationsService.markAllReadForUser(req.user.userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch(':id/respond')
  respond(@Param('id') id: string, @Body() body: { response: 'accepted' | 'refused' }) {
    return this.notificationsService.respond(id, body.response as any);
  }

  @Delete('clear-all')
  clearAll(@Req() req: any) {
    return this.notificationsService.clearAllForUser(req.user.userId);
  }

  @Delete(':id')
  dismiss(@Param('id') id: string) {
    return this.notificationsService.dismiss(id);
  }
}

