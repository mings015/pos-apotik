import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ReportsService } from './reports.service'
import { QueryReportDto } from './dto/query-reports.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getSales(@Query() query: QueryReportDto) {
    const data = await this.reportsService.getSalesReport(query)
    return { success: true, message: 'Berhasil mengambil laporan penjualan', data }
  }

  @Get('profit')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getProfit(@Query() query: QueryReportDto) {
    const data = await this.reportsService.getProfitReport(query)
    return { success: true, message: 'Berhasil mengambil laporan profit', data }
  }

  @Get('stocks')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getStocks(@Query() query: QueryReportDto) {
    const data = await this.reportsService.getStocksReport(query)
    return { success: true, message: 'Berhasil mengambil laporan stok', data }
  }

  @Get('expired')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getExpired(@Query() query: QueryReportDto) {
    const data = await this.reportsService.getExpiredReport(query)
    return { success: true, message: 'Berhasil mengambil laporan expired', data }
  }

  @Get('cashiers')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getCashiers(@Query() query: QueryReportDto) {
    const data = await this.reportsService.getCashiersReport(query)
    return { success: true, message: 'Berhasil mengambil laporan kasir', data }
  }
}
