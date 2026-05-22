import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { UpdateSettingDto } from './dto/update-setting.dto'

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    let setting = await this.prisma.setting.findFirst()
    if (!setting) {
      setting = await this.prisma.setting.create({
        data: { storeName: 'Apotik PharmaPOS', taxPercentage: 11, autoPrint: false },
      })
    }
    return setting
  }

  async update(dto: UpdateSettingDto) {
    const setting = await this.get()
    return this.prisma.setting.update({ where: { id: setting.id }, data: dto })
  }
}
