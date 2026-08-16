import { Controller, Get, Delete, Post, Req, UseGuards, UploadedFile, BadRequestException, UseInterceptors, Param, Res, NotFoundException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/auth.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me/avatar')
  @UseGuards(AuthGuard)
  async getAvatar(@Req() req: Request & { user: AuthUser }) {
    return this.users.getAvatar(req.user.id);
  }

  @Post('me/avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadAvatar(@Req() req: Request & { user: AuthUser }, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.users.uploadAvatar(req.user.id, file);
  }

  @Delete('me/avatar')
  @UseGuards(AuthGuard)
  async deleteAvatar(@Req() req: Request & { user: AuthUser }) {
    return this.users.deleteAvatar(req.user.id);
  }

  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @Get('avatar/:id')
  async getPublicAvatar(@Param('id') userId: string, @Res() res: Response) {
    const result = await this.users.serveAvatar(userId);
    if (!result) {
      throw new NotFoundException('Avatar not found');
    }
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(result.stream);
  }
}
