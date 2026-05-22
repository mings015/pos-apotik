import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common'
import { InventoryService } from './inventory.service'
import { StockInDto } from './dto/stock-in.dto'
import { StockOutDto } from './dto/stock-out.dto'
import { AdjustmentDto } from './dto/adjustment.dto'
import { OpnameDto } from './dto/opname.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { PaginationDto } from '../../common/dto/pagination.dto'

interface AuthUser { id: string }

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('overview')
  async getOverview() {
    const data = await this.inventoryService.getOverview()
    return { success: true, message: 'Overview berhasil diambil', data }
  }

  @Get()
  async getStockList(@Query() query: PaginationDto) {
    const data = await this.inventoryService.getStockList(query)
    return { success: true, message: 'Daftar stok berhasil diambil', data }
  }

  @Post('stock-in')
  @Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE')
  async stockIn(@Body() dto: StockInDto, @CurrentUser() user: AuthUser) {
    const data = await this.inventoryService.stockIn(dto, user.id)
    return { success: true, message: 'Stok masuk berhasil dicatat', data }
  }

  @Post('stock-out')
  @Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE')
  async stockOut(@Body() dto: StockOutDto, @CurrentUser() user: AuthUser) {
    await this.inventoryService.stockOut(dto, user.id)
    return { success: true, message: 'Stok keluar berhasil dicatat' }
  }

  @Post('adjustment')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async adjustment(@Body() dto: AdjustmentDto, @CurrentUser() user: AuthUser) {
    await this.inventoryService.adjustment(dto, user.id)
    return { success: true, message: 'Adjustment stok berhasil dicatat' }
  }

  @Post('opname')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async opname(@Body() dto: OpnameDto, @CurrentUser() user: AuthUser) {
    const data = await this.inventoryService.opname(dto, user.id)
    return { success: true, message: 'Stock opname berhasil disimpan', data }
  }
}
