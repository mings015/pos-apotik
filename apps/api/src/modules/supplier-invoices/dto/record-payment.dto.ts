import { IsNumber, IsString, IsOptional, IsIn, IsDateString, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class RecordPaymentDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number

  @IsIn(['CASH', 'TRANSFER', 'CHECK'])
  paymentMethod!: string

  @IsDateString()
  paymentDate!: string

  @IsOptional()
  @IsString()
  notes?: string
}
