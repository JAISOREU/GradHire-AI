import { Controller, Get, Delete, Post, Req, UseGuards, UploadedFile, BadRequestException, UseInterceptors, Param, Res, NotFoundException, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
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
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
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

  @Get('me/banner')
  @UseGuards(AuthGuard)
  async getBanner(@Req() req: Request & { user: AuthUser }) {
    return this.users.getBanner(req.user.id);
  }

  @Post('me/banner')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadBanner(@Req() req: Request & { user: AuthUser }, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.users.uploadBanner(req.user.id, file);
  }

  @Delete('me/banner')
  @UseGuards(AuthGuard)
  async deleteBanner(@Req() req: Request & { user: AuthUser }) {
    return this.users.deleteBanner(req.user.id);
  }

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Get('banner/:id')
  async getPublicBanner(@Param('id') userId: string, @Res() res: Response) {
    const result = await this.users.serveBanner(userId);
    if (!result) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.send('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300"><rect fill="#635bff" width="1200" height="300"/></svg>');
      return;
    }
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.send(result.stream);
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Delete('me')
  @UseGuards(AuthGuard)
  async deleteAccount(@Req() req: Request & { user: AuthUser }, @Body() payload: { password?: string }) {
    return this.users.deleteAccount(req.user.id, payload.password);
  }

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Get('avatar/:id')
  async getPublicAvatar(@Param('id') userId: string, @Res() res: Response) {
    const result = await this.users.serveAvatar(userId);
    if (!result) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.send('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#e2e8f0" width="100" height="100"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-size="40">?</text></svg>');
      return;
    }
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.send(result.stream);
  }
}
