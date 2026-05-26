import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common'
import { SupplierInvoicesService } from './supplier-invoices.service'
import { QuerySupplierInvoiceDto } from './dto/query-supplier-invoice.dto'
import { RecordPaymentDto } from './dto/record-payment.dto'
import { UpdateInvoiceDto } from './dto/update-invoice.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@Controller('supplier-invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupplierInvoicesController {
  constructor(private readonly supplierInvoicesService: SupplierInvoicesService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async findAll(@Query() query: QuerySupplierInvoiceDto) {
    const data = await this.supplierInvoicesService.findAll(query)
    return { success: true, message: 'Berhasil mengambil daftar invoice', data }
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async findOne(@Param('id') id: string) {
    const data = await this.supplierInvoicesService.findOne(id)
    return { success: true, message: 'Berhasil mengambil detail invoice', data }
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    const data = await this.supplierInvoicesService.updateInvoice(id, dto)
    return { success: true, message: 'Invoice berhasil diperbarui', data }
  }

  @Patch(':id/payment')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async recordPayment(@Param('id') id: string, @Body() dto: RecordPaymentDto, @CurrentUser() user: any) {
    const data = await this.supplierInvoicesService.recordPayment(id, dto, user.id)
    return { success: true, message: 'Pembayaran berhasil dicatat', data }
  }
}
