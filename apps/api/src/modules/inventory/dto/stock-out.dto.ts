import { IsString, IsInt, IsOptional, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class StockOutDto {
  @IsString()
  productId!: string

  @IsOptional()
  @IsString()
  batchId?: string

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number

  @IsOptional()
  @IsString()
  notes?: string
}
