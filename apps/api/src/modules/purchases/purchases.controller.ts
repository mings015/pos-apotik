import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common'
import { PurchasesService } from './purchases.service'
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto'
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto'
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE')
  async findAll(@Query() query: QueryPurchaseOrderDto) {
    const data = await this.purchasesService.findAll(query)
    return { success: true, message: 'Berhasil mengambil daftar purchase order', data }
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE')
  async findOne(@Param('id') id: string) {
    const data = await this.purchasesService.findOne(id)
    return { success: true, message: 'Berhasil mengambil detail purchase order', data }
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE')
  async create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser() user: any) {
    const data = await this.purchasesService.create(dto, user.id)
    return { success: true, message: 'Purchase order berhasil dibuat', data }
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    const data = await this.purchasesService.updateStatus(id, dto)
    return { success: true, message: 'Purchase order berhasil diperbarui', data }
  }
}
