import { IsOptional, IsString, IsInt, Min, Max, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'

export class QueryReportDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 25

  @IsOptional()
  @IsDateString()
  dateFrom?: string

  @IsOptional()
  @IsDateString()
  dateTo?: string

  @IsOptional()
  @IsString()
  cashierId?: string

  @IsOptional()
  @IsString()
  paymentMethod?: string

  @IsOptional()
  @IsString()
  categoryId?: string

  @IsOptional()
  @IsString()
  supplierId?: string

  @IsOptional()
  @IsString()
  stockStatus?: string

  @IsOptional()
  @IsString()
  status?: string
}
