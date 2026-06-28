import { IsString, IsBoolean, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  areaId!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  taxEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readingThresholdProfileId?: string;

  @ApiPropertyOptional({ enum: ['billable', 'report_only'], default: 'report_only' })
  @IsOptional()
  @IsEnum(['billable', 'report_only'] as const)
  waterDifferenceMode?: 'billable' | 'report_only';
}
