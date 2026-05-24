import { IsOptional, IsString, IsIn } from 'class-validator'
import { PaginationDto } from '../../../common/dto/pagination.dto'

export class QuerySaleDto extends PaginationDto {
  @IsOptional()
  @IsIn(['HOLD', 'COMPLETED', 'CANCELLED'])
  status?: string

  @IsOptional()
  @IsString()
  dateFrom?: string

  @IsOptional()
  @IsString()
  dateTo?: string

  @IsOptional()
  @IsString()
  cashierId?: string
}
