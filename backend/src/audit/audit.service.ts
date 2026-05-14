import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditEntity } from '../entities/audit-log.entity.js';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(
    action: AuditAction,
    entity: AuditEntity,
    entityId: string | null,
    userId: string | null,
    userName: string,
    details: string,
  ): Promise<void> {
    const entry = this.auditRepo.create({
      action,
      entity,
      entityId: entityId ?? '',
      userId: userId ?? '',
      userName,
      details,
    });
    await this.auditRepo.save(entry);
  }

  async findAll(query?: {
    action?: string;
    entity?: string;
    entityId?: string;
    limit?: number;
  }) {
    const qb = this.auditRepo.createQueryBuilder('log');

    if (query?.action) {
      qb.andWhere('log.action = :action', { action: query.action });
    }
    if (query?.entity) {
      qb.andWhere('log.entity = :entity', { entity: query.entity });
    }
    if (query?.entityId) {
      qb.andWhere('log.entity_id = :entityId', { entityId: query.entityId });
    }

    qb.orderBy('log.timestamp', 'DESC');
    qb.take(query?.limit || 100);

    return qb.getMany();
  }

  async getStats() {
    const actionCounts = await this.auditRepo
      .createQueryBuilder('log')
      .select('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.action')
      .getRawMany();

    const entityCounts = await this.auditRepo
      .createQueryBuilder('log')
      .select('log.entity', 'entity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.entity')
      .getRawMany();

    const totalLogs = await this.auditRepo.count();

    return { totalLogs, actionCounts, entityCounts };
  }
}
