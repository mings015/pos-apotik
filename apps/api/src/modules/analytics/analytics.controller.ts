import { Controller, Get, UseGuards } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE')
  async getDashboard() {
    const data = await this.analyticsService.getDashboardStats()
    return { success: true, message: 'Berhasil mengambil data dashboard', data }
  }
}
