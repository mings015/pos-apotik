import { Module } from '@nestjs/common'
import { GoodsReceivingController } from './goods-receiving.controller'
import { GoodsReceivingService } from './goods-receiving.service'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [GoodsReceivingController],
  providers: [GoodsReceivingService],
})
export class GoodsReceivingModule {}
