import { IsOptional, IsString, IsIn, IsUUID } from 'class-validator'
import { PaginationDto } from '../../../common/dto/pagination.dto'

export class QueryPurchaseOrderDto extends PaginationDto {
  @IsOptional()
  @IsIn(['DRAFT', 'PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED'])
  status?: string

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
