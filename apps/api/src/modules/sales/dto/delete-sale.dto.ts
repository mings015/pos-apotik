import { IsString, MinLength } from 'class-validator'

export class DeleteSaleDto {
  @IsString()
  @MinLength(1)
  password!: string
}
