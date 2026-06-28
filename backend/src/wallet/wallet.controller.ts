import { Controller, Get, Post, Param, Body, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GlobalAuthGuard } from '../auth/global-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(GlobalAuthGuard, RolesGuard)
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get(':customerId')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Get customer wallet' })
  async getWallet(@Param('customerId') customerId: string, @Req() req: any) {
    const projectId = req.query?.projectId || 'default';
    return this.wallet.getOrCreateWallet(customerId, projectId);
  }

  @Post(':walletId/credit')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Credit wallet' })
  async credit(@Param('walletId') walletId: string, @Body() dto: { amount: number; referenceType: string; referenceId: string; description: string }) {
    return this.wallet.credit(walletId, dto.amount, dto.referenceType, dto.referenceId, dto.description);
  }

  @Post(':walletId/debit')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Debit wallet' })
  async debit(@Param('walletId') walletId: string, @Body() dto: { amount: number; referenceType: string; referenceId: string; description: string }) {
    return this.wallet.debit(walletId, dto.amount, dto.referenceType, dto.referenceId, dto.description);
  }

  @Post('transfer')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transfer between wallets' })
  async transfer(@Body() dto: { fromWalletId: string; toWalletId: string; amount: number; description: string }) {
    return this.wallet.transfer(dto.fromWalletId, dto.toWalletId, dto.amount, dto.description);
  }

  @Get(':walletId/history')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Get wallet transaction history' })
  async getHistory(@Param('walletId') walletId: string) {
    return this.wallet.getHistory(walletId);
  }

  @Get(':walletId/balance')
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.FINANCE)
  @ApiOperation({ summary: 'Get wallet balance' })
  async getBalance(@Param('walletId') walletId: string) {
    const b = await this.wallet.getBalance(walletId);
    return { walletId, balance: b };
  }
}
