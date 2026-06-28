import { IsString, IsUUID, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferOwnershipDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('all')
  newCustomerId!: string;

  @ApiProperty()
  @IsString()
  reason!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  transferOptions?: string[];
}

export class OwnershipTransferResultDto {
  customerId!: string;
  newCustomerId!: string;
  transferredRecords!: Record<string, number>;
  skippedRecords!: Record<string, number>;
  timestamp!: Date;
}
