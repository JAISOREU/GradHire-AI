import { Controller, Get, Delete, Post, Req, UseGuards, UploadedFile, BadRequestException, UseInterceptors, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/auth.service';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me/avatar')
  async getAvatar(@Req() req: Request & { user: AuthUser }) {
    return this.users.getAvatar(req.user.id);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@Req() req: Request & { user: AuthUser }, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.users.uploadAvatar(req.user.id, file);
  }

  @Delete('me/avatar')
  async deleteAvatar(@Req() req: Request & { user: AuthUser }) {
    return this.users.deleteAvatar(req.user.id);
  }

  @Get('avatar/:id')
  async getPublicAvatar(@Param('id') userId: string, @Res() res: Response) {
    const result = await this.users.serveAvatar(userId);
    if (!result) {
      throw new NotFoundException('Avatar not found');
    }
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    result.stream.pipe(res);
  }
}
