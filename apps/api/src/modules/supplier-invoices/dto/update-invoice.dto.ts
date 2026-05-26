import { IsOptional, IsString, IsDateString } from 'class-validator'

export class UpdateInvoiceDto {
  @IsOptional()
  @IsDateString()
  dueDate?: string

  @IsOptional()
  @IsString()
  notes?: string
}
