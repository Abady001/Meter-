import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationResponseDto } from './dto/location-response.dto';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    projectId: string,
    dto: CreateLocationDto,
    userId: string
  ): Promise<LocationResponseDto> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    if (dto.parentId) {
      const parent = await this.prisma.locationNode.findUnique({ where: { id: dto.parentId } });
      if (!parent || parent.projectId !== projectId) {
        throw new NotFoundException(
          `Parent location ${dto.parentId} not found in project ${projectId}`
        );
      }
    }

    const node = await this.prisma.locationNode.create({
      data: {
        projectId,
        parentId: dto.parentId ?? undefined,
        nodeType: dto.nodeType,
        code: dto.code,
        name: dto.name,
        createdBy: userId,
        updatedBy: userId
      }
    });
    return this.toResponse(node);
  }

  async findAll(projectId: string): Promise<LocationResponseDto[]> {
    const nodes = await this.prisma.locationNode.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
    return nodes.map(this.toResponse);
  }

  async findOne(projectId: string, id: string): Promise<LocationResponseDto> {
    const node = await this.prisma.locationNode.findUnique({ where: { id } });
    if (!node || node.projectId !== projectId) {
      throw new NotFoundException(`Location ${id} not found in project ${projectId}`);
    }
    return this.toResponse(node);
  }

  async update(
    projectId: string,
    id: string,
    dto: UpdateLocationDto,
    userId: string
  ): Promise<LocationResponseDto> {
    await this.findOne(projectId, id);

    if (dto.parentId) {
      const parent = await this.prisma.locationNode.findUnique({ where: { id: dto.parentId } });
      if (!parent || parent.projectId !== projectId) {
        throw new NotFoundException(
          `Parent location ${dto.parentId} not found in project ${projectId}`
        );
      }
    }

    const node = await this.prisma.locationNode.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        parentId: dto.parentId,
        status: dto.status,
        updatedBy: userId
      }
    });
    return this.toResponse(node);
  }

  async remove(projectId: string, id: string, userId: string): Promise<void> {
    await this.findOne(projectId, id);
    await this.prisma.locationNode.update({
      where: { id },
      data: { status: 'inactive', updatedBy: userId }
    });
  }

  async assignMeter(projectId: string, unitId: string, meterId: string, userId: string): Promise<any> {
    await this.findOne(projectId, unitId);
    const meter = await this.prisma.meter.findUnique({ where: { id: meterId } });
    if (!meter) throw new NotFoundException('Meter not found');

    // End any active assignment
    await this.prisma.meterAssignment.updateMany({
      where: { meterId, status: 'active' },
      data: { status: 'ended', endAt: new Date(), updatedBy: userId },
    });

    const assignment = await this.prisma.meterAssignment.create({
      data: {
        meterId,
        unitId,
        projectId,
        customerId: '',
        startAt: new Date(),
        status: 'active',
        changeReason: 'Assigned to unit',
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.prisma.meter.update({ where: { id: meterId }, data: { status: 'assigned', updatedBy: userId } });
    return assignment;
  }

  async replaceMeter(projectId: string, unitId: string, oldMeterId: string, newMeterId: string, reason: string | undefined, userId: string): Promise<any> {
    await this.findOne(projectId, unitId);
    // Deactivate old meter
    await this.prisma.meterAssignment.updateMany({
      where: { meterId: oldMeterId, status: 'active' },
      data: { status: 'ended', endAt: new Date(), changeReason: reason || 'Replaced', updatedBy: userId },
    });
    await this.prisma.meter.update({ where: { id: oldMeterId }, data: { status: 'replaced', updatedBy: userId } });
    // Activate new meter
    return this.assignMeter(projectId, unitId, newMeterId, userId);
  }

  async disconnectMeter(projectId: string, unitId: string, meterId: string, reason: string | undefined, userId: string): Promise<any> {
    await this.findOne(projectId, unitId);
    await this.prisma.meterAssignment.updateMany({
      where: { meterId, status: 'active' },
      data: { status: 'ended', endAt: new Date(), changeReason: reason || 'Disconnected', updatedBy: userId },
    });
    await this.prisma.meter.update({ where: { id: meterId }, data: { status: 'available', updatedBy: userId } });
    return { message: 'Meter disconnected from unit' };
  }

  async changeCustomer(projectId: string, unitId: string, customerId: string, reason: string | undefined, userId: string): Promise<any> {
    await this.findOne(projectId, unitId);
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    // Update unit assignment
    await this.prisma.customerUnitAssignment.updateMany({
      where: { unitId, endAt: null },
      data: { endAt: new Date(), updatedBy: userId },
    });
    const assignment = await this.prisma.customerUnitAssignment.create({
      data: {
        customerId,
        unitId,
        startAt: new Date(),
        reason: reason || 'Customer changed',
        createdBy: userId,
        updatedBy: userId,
      },
    });
    return assignment;
  }

  async closeUnit(projectId: string, unitId: string, reason: string | undefined, userId: string): Promise<any> {
    await this.findOne(projectId, unitId);
    // End all active assignments
    await this.prisma.meterAssignment.updateMany({
      where: { unitId, status: 'active' },
      data: { status: 'ended', endAt: new Date(), changeReason: reason || 'Unit closed', updatedBy: userId },
    });
    await this.prisma.customerUnitAssignment.updateMany({
      where: { unitId, endAt: null },
      data: { endAt: new Date(), updatedBy: userId },
    });
    await this.prisma.locationNode.update({
      where: { id: unitId },
      data: { status: 'inactive', updatedBy: userId },
    });
    return { message: 'Unit closed' };
  }

  private toResponse(node: {
    id: string;
    projectId: string;
    parentId?: string | null;
    nodeType: string;
    code: string;
    name: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): LocationResponseDto {
    return {
      id: node.id,
      projectId: node.projectId,
      parentId: node.parentId ?? null,
      nodeType: node.nodeType,
      code: node.code,
      name: node.name,
      status: node.status,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt
    };
  }
}
