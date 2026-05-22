import { IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '../../../common/dto/pagination.dto'

export class QueryProductDto extends PaginationDto {
  @IsOptional()
  @IsString()
  categoryId?: string

  @IsOptional()
  @IsString()
  supplierId?: string
}
