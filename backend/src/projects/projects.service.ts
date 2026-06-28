import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.coreProject.create({
      data: {
        projectCode: dto.code,
        projectName: dto.name,
        areaId: dto.areaId || '',
        isActive: true,
      },
    });
    return this.toResponse(project);
  }

  async findAll(areaId?: string): Promise<ProjectResponseDto[]> {
    const where: any = {};
    if (areaId) where.areaId = areaId;
    const projects = await this.prisma.coreProject.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return projects.map(this.toResponse);
  }

  async findOne(id: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.coreProject.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return this.toResponse(project);
  }

  async update(id: string, dto: UpdateProjectDto, userId: string): Promise<ProjectResponseDto> {
    await this.findOne(id);
    const data: any = {};
    if (dto.code !== undefined) data.projectCode = dto.code;
    if (dto.name !== undefined) data.projectName = dto.name;
    if (dto.status !== undefined) data.isActive = dto.status === 'active';
    if (dto.areaId !== undefined) data.areaId = dto.areaId;
    const project = await this.prisma.coreProject.update({ where: { id }, data });
    return this.toResponse(project);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.coreProject.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private toResponse(project: {
    id: string;
    projectCode: string;
    projectName: string;
    areaId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ProjectResponseDto {
    return {
      id: project.id,
      code: project.projectCode,
      name: project.projectName,
      status: project.isActive ? 'active' : 'inactive',
      areaId: project.areaId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    } as any;
  }
}
