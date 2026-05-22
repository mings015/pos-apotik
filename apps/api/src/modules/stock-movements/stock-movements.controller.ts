import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { StockMovementsService, StockMovementQueryDto } from './stock-movements.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'

@Controller('stock-movements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockMovementsController {
  constructor(private stockMovementsService: StockMovementsService) {}

  @Get()
  async findAll(@Query() query: StockMovementQueryDto) {
    const data = await this.stockMovementsService.findAll(query)
    return { success: true, message: 'Riwayat pergerakan stok berhasil diambil', data }
  }
}
