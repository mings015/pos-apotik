import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { BatchesService, BatchQueryDto } from './batches.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'

@Controller('batches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BatchesController {
  constructor(private batchesService: BatchesService) {}

  @Get()
  async findAll(@Query() query: BatchQueryDto) {
    const data = await this.batchesService.findAll(query)
    return { success: true, message: 'Daftar batch berhasil diambil', data }
  }
}
