import { IsOptional, IsString, IsUUID } from 'class-validator'
import { PaginationDto } from '../../../common/dto/pagination.dto'

export class QueryPurchaseReturnDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  supplierInvoiceId?: string

  @IsOptional()
  @IsString()
  dateFrom?: string

  @IsOptional()
  @IsString()
  dateTo?: string
}
