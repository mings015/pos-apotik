import { IsString, IsUUID, IsInt, IsNumber, IsOptional, IsArray, ValidateNested, Min, ArrayMinSize } from 'class-validator'
import { Type } from 'class-transformer'

export class CreatePurchaseOrderItemDto {
  @IsUUID()
  productId!: string

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchasePrice!: number
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  supplierId!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  @ArrayMinSize(1)
  items!: CreatePurchaseOrderItemDto[]

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  tax?: number = 0

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number = 0

  @IsOptional()
  @IsString()
  notes?: string
}
