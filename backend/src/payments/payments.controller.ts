import { Controller, Get, Post, Patch, Delete, Param, Body, ParseUUIDPipe, UseGuards, Query, HttpCode, HttpStatus, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { Audit } from '../audit/audit.decorator';
import { PaymentsService } from './payments.service';
import { ReversePaymentDto } from './dto/reverse-payment.dto';
import { PrismaService } from '../common/database/prisma.service';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  @ApiOperation({ summary: 'List payments' })
  async findAll(
    @Query('projectId') projectId?: string,
    @Query('customerId') customerId?: string,
    @Req() req?: any
  ) {
    if (req?.areaId && req?.userAccess?.projectIds?.length) {
      if (projectId && !req.userAccess.projectIds.includes(projectId)) {
        throw new ForbiddenException('Access denied for this project in the current area');
      }
      if (!projectId) {
        const results = await Promise.all(
          (req.userAccess.projectIds as string[]).map((p: string) => this.paymentsService.findAll(p, customerId))
        );
        return results.flat();
      }
    }
    return this.paymentsService.findAll(projectId, customerId);
  }

  @Get(':id')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE, Role.SUPPORT)
  @ApiOperation({ summary: 'Get payment by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update payment notes' })
  @HttpCode(HttpStatus.OK)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { notes?: string; status?: string }) {
    const data: any = {};
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.status) data.status = dto.status;
    await this.prisma.payment.update({ where: { id }, data });
    return { status: 'updated' };
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Audit('payment', 'delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a pending payment' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) return { status: 'not_found' };
    if (payment.status !== 'pending') return { status: 'cannot_delete' };
    await this.prisma.payment.delete({ where: { id } });
    return { status: 'deleted' };
  }

  @Post(':id/reverse')
  @Roles(Role.SUPER_ADMIN)
  @Audit('payment', 'reverse')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reverse a payment' })
  async reverse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReversePaymentDto
  ) {
    return this.paymentsService.reverse(id, dto.reason);
  }
}
