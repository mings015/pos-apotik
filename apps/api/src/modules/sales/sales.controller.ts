import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common'
import { SalesService } from './sales.service'
import { CreateSaleDto } from './dto/create-sale.dto'
import { CheckoutHoldDto } from './dto/checkout-hold.dto'
import { QuerySaleDto } from './dto/query-sale.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

interface AuthUser { id: string }

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'CASHIER')
  async findAll(@Query() query: QuerySaleDto) {
    const data = await this.salesService.findAll(query)
    return { success: true, message: 'Daftar transaksi berhasil diambil', data }
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CASHIER')
  async findOne(@Param('id') id: string) {
    const data = await this.salesService.findOne(id)
    return { success: true, message: 'Detail transaksi berhasil diambil', data }
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'CASHIER')
  async create(@Body() dto: CreateSaleDto, @CurrentUser() user: AuthUser) {
    const data = await this.salesService.create(dto, user.id)
    return { success: true, message: dto.status === 'HOLD' ? 'Transaksi berhasil di-hold' : 'Transaksi berhasil diselesaikan', data }
  }

  @Patch(':id/checkout')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CASHIER')
  async checkoutHold(@Param('id') id: string, @Body() dto: CheckoutHoldDto, @CurrentUser() user: AuthUser) {
    const data = await this.salesService.checkoutHold(id, dto, user.id)
    return { success: true, message: 'Transaksi berhasil diselesaikan', data }
  }

  @Patch(':id/cancel')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CASHIER')
  async cancelHold(@Param('id') id: string) {
    await this.salesService.cancelHold(id)
    return { success: true, message: 'Transaksi berhasil dibatalkan' }
  }
}
