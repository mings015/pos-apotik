import { IsString, IsEmail, IsBoolean, IsOptional, MinLength } from 'class-validator'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Nama minimal 2 karakter' })
  name?: string

  @IsOptional()
  @IsEmail({}, { message: 'Email tidak valid' })
  email?: string

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password?: string

  @IsOptional()
  @IsString()
  roleId?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
