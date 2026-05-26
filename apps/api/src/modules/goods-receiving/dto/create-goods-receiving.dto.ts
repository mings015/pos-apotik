import { IsString, IsUUID, IsInt, IsNumber, IsOptional, IsArray, ValidateNested, Min, ArrayMinSize, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateGoodsReceivingItemDto {
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

  @IsString()
  batchNumber!: string

  @IsDateString()
  expiredDate!: string
}

export class CreateGoodsReceivingDto {
  @IsUUID()
  purchaseOrderId!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsReceivingItemDto)
  @ArrayMinSize(1)
  items!: CreateGoodsReceivingItemDto[]

  @IsOptional()
  @IsString()
  notes?: string
}
