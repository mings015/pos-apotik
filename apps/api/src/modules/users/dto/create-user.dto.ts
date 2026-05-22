import { IsString, IsEmail, IsBoolean, IsOptional, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: 'Nama minimal 2 karakter' })
  name!: string

  @IsEmail({}, { message: 'Email tidak valid' })
  email!: string

  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password!: string

  @IsString()
  roleId!: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true
}
