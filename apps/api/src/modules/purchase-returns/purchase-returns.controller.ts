import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common'
import { PurchaseReturnsService } from './purchase-returns.service'
import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto'
import { QueryPurchaseReturnDto } from './dto/query-purchase-return.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@Controller('purchase-returns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchaseReturnsController {
  constructor(private readonly purchaseReturnsService: PurchaseReturnsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE')
  async findAll(@Query() query: QueryPurchaseReturnDto) {
    const data = await this.purchaseReturnsService.findAll(query)
    return { success: true, message: 'Berhasil mengambil daftar retur', data }
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE')
  async findOne(@Param('id') id: string) {
    const data = await this.purchaseReturnsService.findOne(id)
    return { success: true, message: 'Berhasil mengambil detail retur', data }
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE')
  async create(@Body() dto: CreatePurchaseReturnDto, @CurrentUser() user: { id: string }) {
    const data = await this.purchaseReturnsService.create(dto, user.id)
    return { success: true, message: 'Retur pembelian berhasil dibuat', data }
  }
}
