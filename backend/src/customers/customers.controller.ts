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
  Req,
  Query,
  ForbiddenException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { Audit } from '../audit/audit.decorator';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { Customer360Service } from './customer-360.service';
import { PrismaService } from '../common/database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';
import { UserAccessService } from '../auth/user-access.service';

@Controller('projects/:projectId/customers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly customer360Service: Customer360Service,
    private readonly userAccess: UserAccessService,
  ) {}

  private async validateProject(projectId: string, req: any): Promise<void> {
    if (req.user?.role !== 'super_admin') {
      try { await this.userAccess.requireProjectAccess(req.user?.userId, req.user?.role, projectId); }
      catch { throw new ForbiddenException('Access denied for this project'); }
    }
  }

  @Get('search')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  @ApiOperation({ summary: 'Search customers across all fields' })
  async search(@Query() query: { q?: string; unitNo?: string; meterSerial?: string; name?: string; email?: string; phone?: string }) {
    const where: any = {};
    if (query.q) {
      const q = query.q;
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { customerCode: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    } else {
      if (query.name) where.name = { contains: query.name, mode: 'insensitive' };
      if (query.email) where.email = { contains: query.email, mode: 'insensitive' };
      if (query.phone) where.phone = { contains: query.phone };
      if (query.unitNo) where.unitNumber = { contains: query.unitNo, mode: 'insensitive' };
      if (query.meterSerial) where.meterSerial = { contains: query.meterSerial, mode: 'insensitive' };
    }
    return this.prisma.customer.findMany({ where, take: 50, orderBy: { name: 'asc' } });
  }

  @Post()
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('customer', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateCustomerDto,
    @Req() req: any
  ) {
    await this.validateProject(projectId, req);
    const customer = await this.customersService.create(projectId, dto, req.user.userId);
    this.notificationsService.create({ userId: req.user.userId, title: `Customer created: ${customer.name}`, type: 'customer', referenceType: 'customer', referenceId: customer.id }).catch(() => {});
    return customer;
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
  async findAll(@Param('projectId', ParseUUIDPipe) projectId: string, @Req() req: any) {
    await this.validateProject(projectId, req);
    if (req.areaId && req.userAccess?.projectIds?.length && !req.userAccess.projectIds.includes(projectId)) {
      throw new ForbiddenException('Access denied for this project in the current area');
    }
    return this.customersService.findAll(projectId);
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
  async findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any
  ) {
    await this.validateProject(projectId, req);
    return this.customersService.findOne(projectId, id);
  }

  @Patch(':id')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('customer', 'update')
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
    @Req() req: any
  ) {
    await this.validateProject(projectId, req);
    return this.customersService.update(projectId, id, dto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('customer', 'deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any
  ) {
    await this.validateProject(projectId, req);
    await this.customersService.remove(projectId, id, req.user.userId);
  }

  @Get(':id/360')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  @ApiOperation({ summary: 'Customer 360 aggregated view' })
  async getCustomer360(@Param('id', ParseUUIDPipe) id: string) {
    return this.customer360Service.getCustomer360(id);
  }

  @Get(':id/statement')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT, Role.CUSTOMER)
  @ApiOperation({ summary: 'Get customer statement with debit/credit/running balance' })
  async getStatement(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Req() req?: any
  ) {
    await this.validateProject(projectId, req);
    await this.customersService.findOne(projectId, id);
    const entries: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT * FROM sim_system.customer_statement_view
       WHERE customer_id = $1
       AND ($2::timestamp IS NULL OR entry_date >= $2)
       AND ($3::timestamp IS NULL OR entry_date <= $3)
       ORDER BY entry_date, ledger_entry_id`,
      id,
      from ? new Date(from) : null,
      to ? new Date(to) : null
    );
    const debitSum = entries.reduce((s, e) => s + Number(e.debit), 0);
    const creditSum = entries.reduce((s, e) => s + Number(e.credit), 0);
    const lastBalance = entries.length > 0 ? Number(entries[entries.length - 1].running_balance) : 0;
    return {
      customerId: id,
      projectId,
      entries: entries.map((e) => ({
        id: e.ledger_entry_id,
        entryDate: e.entry_date,
        referenceType: e.reference_type,
        referenceId: e.reference_id,
        debit: Number(e.debit),
        credit: Number(e.credit),
        runningBalance: Number(e.running_balance)
      })),
      summary: {
        totalEntries: entries.length,
        totalDebit: debitSum,
        totalCredit: creditSum,
        currentBalance: lastBalance
      }
    };
  }

  @Post(':id/transfer-ownership')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('customer', 'transfer_ownership')
  @ApiOperation({ summary: 'Transfer customer ownership to another customer' })
  @ApiBody({ type: TransferOwnershipDto })
  @HttpCode(HttpStatus.OK)
  async transferOwnership(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferOwnershipDto,
    @Req() req: any
  ) {
    await this.validateProject(projectId, req);
    return this.customersService.transferOwnership(projectId, id, dto, req.user.userId);
  }

  @Post(':id/merge')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('customer', 'merge')
  @ApiOperation({ summary: 'Merge two customer records' })
  @HttpCode(HttpStatus.OK)
  async mergeCustomer(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { targetCustomerId: string },
    @Req() req: any
  ) {
    await this.validateProject(projectId, req);
    return this.customersService.mergeCustomers(projectId, id, dto.targetCustomerId, req.user.userId);
  }

  @Post(':id/archive')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('customer', 'archive')
  @ApiOperation({ summary: 'Archive customer with history preservation' })
  @HttpCode(HttpStatus.OK)
  async archiveCustomer(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any
  ) {
    await this.validateProject(projectId, req);
    return this.customersService.archiveCustomer(id, req.user.userId);
  }
}
