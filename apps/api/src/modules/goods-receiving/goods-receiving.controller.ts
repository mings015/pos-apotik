import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common'
import { GoodsReceivingService } from './goods-receiving.service'
import { CreateGoodsReceivingDto } from './dto/create-goods-receiving.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@Controller('goods-receiving')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GoodsReceivingController {
  constructor(private readonly goodsReceivingService: GoodsReceivingService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE')
  async receive(@Body() dto: CreateGoodsReceivingDto, @CurrentUser() user: any) {
    const data = await this.goodsReceivingService.receive(dto, user.id)
    return { success: true, message: 'Barang berhasil diterima dan stok diperbarui', data }
  }

  @Get(':purchaseOrderId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE')
  async findByPurchaseOrder(@Param('purchaseOrderId') purchaseOrderId: string) {
    const data = await this.goodsReceivingService.findByPurchaseOrder(purchaseOrderId)
    return { success: true, message: 'Berhasil mengambil data penerimaan', data }
  }
}
