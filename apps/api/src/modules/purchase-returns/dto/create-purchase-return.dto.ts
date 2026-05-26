import { IsString, IsUUID, IsInt, IsOptional, IsArray, ValidateNested, Min, ArrayMinSize, MinLength } from 'class-validator'
import { Type } from 'class-transformer'

export class CreatePurchaseReturnItemDto {
  @IsUUID()
  productId!: string

  @IsUUID()
  batchId!: string

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number
}

export class CreatePurchaseReturnDto {
  @IsUUID()
  supplierInvoiceId!: string

  @IsString()
  @MinLength(3)
  reason!: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseReturnItemDto)
  @ArrayMinSize(1)
  items!: CreatePurchaseReturnItemDto[]

  @IsOptional()
  @IsString()
  notes?: string
}
