import { IsOptional, IsString, IsIn, IsUUID } from 'class-validator'
import { PaginationDto } from '../../../common/dto/pagination.dto'

export class QuerySupplierInvoiceDto extends PaginationDto {
  @IsOptional()
  @IsIn(['UNPAID', 'PARTIAL', 'PAID'])
  paymentStatus?: string

  @IsOptional()
  @IsUUID()
  supplierId?: string

  @IsOptional()
  @IsString()
  dateFrom?: string

  @IsOptional()
  @IsString()
  dateTo?: string
}
