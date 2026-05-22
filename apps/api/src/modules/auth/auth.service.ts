import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'

interface ResetTokenPayload {
  sub: string
  type: string
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    })

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Email atau password salah')
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akun Anda telah dinonaktifkan')
    }

    const payload = { sub: user.id, email: user.email }
    const accessToken = this.jwt.sign(payload)
    const { password: _password, ...userWithoutPassword } = user

    return { accessToken, user: userWithoutPassword }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user) throw new NotFoundException('Email tidak ditemukan')

    const resetToken = this.jwt.sign(
      { sub: user.id, type: 'reset' },
      {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: '1h',
      },
    )

    // TODO: Kirim email berisi link reset password
    // Untuk development, token dikembalikan langsung
    return { token: resetToken }
  }

  async resetPassword(dto: ResetPasswordDto) {
    let payload: ResetTokenPayload
    try {
      payload = this.jwt.verify<ResetTokenPayload>(dto.token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      })
    } catch {
      throw new UnauthorizedException('Token reset password tidak valid atau sudah kadaluarsa')
    }

    if (payload.type !== 'reset') {
      throw new UnauthorizedException('Token tidak valid')
    }

    const hashed = await bcrypt.hash(dto.password, 10)
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { password: hashed },
    })
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })
    if (!user) throw new NotFoundException('User tidak ditemukan')
    const { password: _password, ...result } = user
    return result
  }
}
