import { IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class CheckoutHoldDto {
  @IsIn(['CASH', 'TRANSFER'])
  paymentMethod!: string

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  amountPaid?: number

  @IsOptional()
  @IsString()
  notes?: string
}
