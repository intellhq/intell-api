import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../../common/enums';

export interface UserCountSummary {
  total: number;
  newThisMonth: number;
}

@Injectable()
export class SuperAdminAction extends AbstractModelAction<User> {
  constructor(@InjectRepository(User) repository: Repository<User>) {
    super(repository, User);
  }

  async getUserCountSummary(): Promise<UserCountSummary> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await this.repository
      .createQueryBuilder('u')
      .select('COUNT(*)', 'total')
      .addSelect(
        `COUNT(*) FILTER (WHERE u.created_at >= :startOfMonth)`,
        'newThisMonth',
      )
      .where('u.deleted_at IS NULL')
      .andWhere('u.role = :role', { role: UserRole.USER })
      .setParameter('startOfMonth', startOfMonth)
      .getRawOne<{ total: string; newThisMonth: string }>();

    return {
      total: parseInt(result?.total ?? '0', 10),
      newThisMonth: parseInt(result?.newThisMonth ?? '0', 10),
    };
  }
}
