import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { TransferOwnershipDto, OwnershipTransferResultDto } from './dto/transfer-ownership.dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    projectId: string,
    dto: CreateCustomerDto,
    userId: string
  ): Promise<CustomerResponseDto> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const customer = await this.prisma.customer.create({
      data: {
        projectId,
        customerCode: dto.customerCode,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        customerType: dto.customerType,
        nationalOrCommercialId: dto.nationalOrCommercialId,
        createdBy: userId,
        updatedBy: userId
      }
    });
    return this.toResponse(customer);
  }

  async findAll(projectId: string): Promise<CustomerResponseDto[]> {
    const customers = await this.prisma.customer.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
    return customers.map(this.toResponse);
  }

  async findOne(projectId: string, id: string): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer || customer.projectId !== projectId) {
      throw new NotFoundException(`Customer ${id} not found in project ${projectId}`);
    }
    return this.toResponse(customer);
  }

  async update(
    projectId: string,
    id: string,
    dto: UpdateCustomerDto,
    userId: string
  ): Promise<CustomerResponseDto> {
    await this.findOne(projectId, id);
    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        customerCode: dto.customerCode,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        customerType: dto.customerType,
        nationalOrCommercialId: dto.nationalOrCommercialId,
        status: dto.status,
        updatedBy: userId
      }
    });
    return this.toResponse(customer);
  }

  async remove(projectId: string, id: string, userId: string): Promise<void> {
    await this.findOne(projectId, id);
    await this.prisma.customer.update({
      where: { id },
      data: { status: 'inactive', updatedBy: userId }
    });
  }

  private toResponse(customer: {
    id: string;
    projectId: string;
    customerCode: string;
    name: string;
    phone: string;
    email: string;
    customerType: string;
    nationalOrCommercialId: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): CustomerResponseDto {
    return {
      id: customer.id,
      projectId: customer.projectId,
      customerCode: customer.customerCode,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      customerType: customer.customerType,
      nationalOrCommercialId: customer.nationalOrCommercialId,
      status: customer.status,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    };
  }

  async transferOwnership(
    projectId: string,
    customerId: string,
    dto: TransferOwnershipDto,
    userId: string
  ): Promise<OwnershipTransferResultDto> {
    if (customerId === dto.newCustomerId) {
      throw new BadRequestException('Cannot transfer ownership to the same customer');
    }

    const source = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!source || source.projectId !== projectId) {
      throw new NotFoundException(`Source customer ${customerId} not found`);
    }

    const target = await this.prisma.customer.findUnique({ where: { id: dto.newCustomerId } });
    if (!target || target.projectId !== projectId) {
      throw new NotFoundException(`Target customer ${dto.newCustomerId} not found`);
    }

    const transferred: Record<string, number> = {};
    const skipped: Record<string, number> = {};

    await this.prisma.$transaction(async (tx) => {
      // 1. Meter assignments
      const meterAssignments = await tx.meterAssignment.updateMany({
        where: { customerId, status: 'active' },
        data: { customerId: dto.newCustomerId }
      });
      transferred.meterAssignments = meterAssignments.count;

      // 2. Customer unit assignments
      const unitAssignments = await tx.customerUnitAssignment.updateMany({
        where: { customerId },
        data: { customerId: dto.newCustomerId }
      });
      transferred.unitAssignments = unitAssignments.count;

      // 3. Invoices (skip paid/cancelled ones to avoid accounting issues)
      const invoiceResult = await tx.invoice.updateMany({
        where: { customerId, status: { notIn: ['paid', 'cancelled'] } },
        data: { customerId: dto.newCustomerId }
      });
      transferred.invoices = invoiceResult.count;

      const skippedInvoices = await tx.invoice.count({
        where: { customerId, status: { in: ['paid', 'cancelled'] } }
      });
      if (skippedInvoices > 0) skipped.invoices = skippedInvoices;

      // 4. Payments
      const payments = await tx.payment.updateMany({
        where: { customerId },
        data: { customerId: dto.newCustomerId }
      });
      transferred.payments = payments.count;

      // 5. Ledger entries
      const ledger = await tx.customerLedgerEntry.updateMany({
        where: { customerId },
        data: { customerId: dto.newCustomerId }
      });
      transferred.ledgerEntries = ledger.count;

      // 6. Wallet accounts
      const walletCheck = await tx.walletAccount.findMany({ where: { customerId } });
      transferred.walletAccounts = walletCheck.length;
      for (const w of walletCheck) {
        await tx.walletAccount.update({
          where: { id: w.id },
          data: { customerId: dto.newCustomerId }
        });
      }

      // 7. Deactivate source customer
      await tx.customer.update({
        where: { id: customerId },
        data: { status: 'inactive', updatedBy: userId }
      });
    });

    return {
      customerId,
      newCustomerId: dto.newCustomerId,
      transferredRecords: transferred,
      skippedRecords: skipped,
      timestamp: new Date()
    };
  }

  async mergeCustomers(projectId: string, sourceId: string, targetId: string, userId: string): Promise<{ message: string; merged: string[] }> {
    const source = await this.prisma.customer.findUnique({ where: { id: sourceId } });
    if (!source) throw new NotFoundException('Source customer not found');
    const target = await this.prisma.customer.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException('Target customer not found');

    const merged: string[] = [];

    await this.prisma.$transaction(async (tx) => {
      // Reassign all meters
      const m = await tx.meterAssignment.updateMany({ where: { customerId: sourceId }, data: { customerId: targetId } });
      if (m.count) merged.push(`${m.count} meter assignments`);

      // Reassign invoices
      const i = await tx.invoice.updateMany({ where: { customerId: sourceId }, data: { customerId: targetId } });
      if (i.count) merged.push(`${i.count} invoices`);

      // Reassign payments
      const p = await tx.payment.updateMany({ where: { customerId: sourceId }, data: { customerId: targetId } });
      if (p.count) merged.push(`${p.count} payments`);

      // Reassign ledger
      const l = await tx.customerLedgerEntry.updateMany({ where: { customerId: sourceId }, data: { customerId: targetId } });
      if (l.count) merged.push(`${l.count} ledger entries`);

      // Archive source
      await tx.customer.update({ where: { id: sourceId }, data: { status: 'inactive', updatedBy: userId } });
    });

    return { message: `Customer ${source.name} merged into ${target.name}`, merged };
  }

  async archiveCustomer(id: string, userId: string): Promise<{ message: string }> {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');

    await this.prisma.customer.update({
      where: { id },
      data: { status: 'inactive', updatedBy: userId },
    });

    await this.prisma.customerLedgerEntry.create({
      data: {
        customerId: id,
        projectId: customer.projectId,
        entryType: 'adjustment_credit',
        referenceType: 'adjustment',
        referenceId: id,
        amountDelta: 0,
        runningBalance: 0,
        entryAt: new Date(),
      },
    });

    return { message: `Customer ${customer.name} archived` };
  }
}
