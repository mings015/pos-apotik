import { IsOptional, IsString, IsIn } from 'class-validator'

export class UpdatePurchaseOrderDto {
  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'CANCELLED'])
  status?: string

  @IsOptional()
  @IsString()
  notes?: string
}
