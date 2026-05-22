import { IsString, IsInt, IsDateString, IsOptional, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class StockInDto {
  @IsString()
  productId!: string

  @IsString()
  batchNumber!: string

  @IsDateString()
  expiredDate!: string

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number

  @IsOptional()
  @IsString()
  notes?: string
}
