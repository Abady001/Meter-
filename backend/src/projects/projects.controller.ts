import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { Audit } from '../audit/audit.decorator';
import { NotificationsService } from '../notifications/notifications.service';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('project', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProjectDto, @Req() req: { user: { userId: string } }) {
    const project = await this.projectsService.create(dto, req.user.userId);
    this.notificationsService.create({ userId: req.user.userId, title: `Project created: ${project.name}`, type: 'project', referenceType: 'assignment', referenceId: project.id }).catch(() => {});
    return project;
  }

  @Get()
  @Roles(
    Role.OPERATOR,
    Role.ADMIN,
    Role.SUPER_ADMIN,
    Role.TECHNICIAN,
    Role.FINANCE,
    Role.SUPPORT
  )
  async findAll(@Req() req: any) {
    // Filter by areaId from header (set by AreaGuard) if available
    const areaId = req.areaId as string | undefined;
    return this.projectsService.findAll(areaId);
  }

  @Get(':id')
  @Roles(
    Role.OPERATOR,
    Role.ADMIN,
    Role.SUPER_ADMIN,
    Role.TECHNICIAN,
    Role.FINANCE,
    Role.SUPPORT
  )
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('project', 'update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @Req() req: { user: { userId: string } }
  ) {
    return this.projectsService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @Audit('project', 'deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: { user: { userId: string } }) {
    await this.projectsService.remove(id, req.user.userId);
  }
}
