import { Module } from '@nestjs/common'
import { SupplierInvoicesController } from './supplier-invoices.controller'
import { SupplierInvoicesService } from './supplier-invoices.service'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [SupplierInvoicesController],
  providers: [SupplierInvoicesService],
})
export class SupplierInvoicesModule {}
