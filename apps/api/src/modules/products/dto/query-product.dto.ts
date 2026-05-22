import { IsOptional, IsString, IsBoolean } from 'class-validator'
import { Transform } from 'class-transformer'
import { PaginationDto } from '../../../common/dto/pagination.dto'

export class QueryProductDto extends PaginationDto {
  @IsOptional()
  @IsString()
  categoryId?: string

  @IsOptional()
  @IsString()
  supplierId?: string

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean
}
