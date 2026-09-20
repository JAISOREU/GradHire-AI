import { Controller, Get, Post, Delete, Param, Query, Req, UseGuards, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { FeedService, FeedPostDto, FeedCommentDto } from './feed.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/auth.service';

@Controller('feed')
@UseGuards(AuthGuard)
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Get()
  getFeed(@Req() req: Request & { user: AuthUser }, @Query('limit') limit?: string): Promise<FeedPostDto[]> {
    return this.feed.getFeed(req.user, limit ? Number(limit) : 50);
  }

  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @Post()
  createPost(
    @Req() req: Request & { user: AuthUser },
    @Body() body: { content?: string; imageUrl?: string | null; jobId?: string | null },
  ): Promise<FeedPostDto> {
    return this.feed.createPost(req.user, {
      content: body.content ?? '',
      imageUrl: body.imageUrl,
      jobId: body.jobId,
    });
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Delete(':postId')
  deletePost(@Req() req: Request & { user: AuthUser }, @Param('postId') postId: string): Promise<{ ok: true }> {
    return this.feed.deletePost(req.user, postId);
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Post(':postId/like')
  toggleLike(@Req() req: Request & { user: AuthUser }, @Param('postId') postId: string): Promise<FeedPostDto> {
    return this.feed.toggleLike(req.user, postId);
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Get(':postId/comments')
  getComments(@Req() req: Request & { user: AuthUser }, @Param('postId') postId: string): Promise<FeedCommentDto[]> {
    return this.feed.getComments(req.user, postId);
  }

  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @Post(':postId/comments')
  addComment(
    @Req() req: Request & { user: AuthUser },
    @Param('postId') postId: string,
    @Body() body: { content?: string },
  ): Promise<FeedPostDto> {
    return this.feed.addComment(req.user, postId, body.content ?? '');
  }
}