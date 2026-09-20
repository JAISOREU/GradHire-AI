import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { CacheModule } from '../cache/cache.module';
import { AuthModule } from '../auth/auth.module';
import { NetworkController } from './network.controller';
import { NetworkService } from './network.service';

@Module({
  imports: [PrismaModule, CacheModule, AuthModule],
  controllers: [NetworkController],
  providers: [NetworkService],
})
export class NetworkModule {}