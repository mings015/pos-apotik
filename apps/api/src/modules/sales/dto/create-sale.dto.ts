import { IsString, IsInt, IsNumber, IsOptional, IsIn, IsArray, ValidateNested, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateSaleItemDto {
  @IsString()
  productId!: string

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number = 0
}

export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[]

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number = 0

  @IsOptional()
  @IsIn(['CASH', 'TRANSFER'])
  paymentMethod?: string

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  amountPaid?: number

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsIn(['HOLD', 'COMPLETED'])
  status?: string = 'COMPLETED'
}
