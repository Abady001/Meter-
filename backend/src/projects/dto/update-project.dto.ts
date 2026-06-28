import { IsString, IsBoolean, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
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
  readingThresholdProfileId?: string | null;

  @ApiPropertyOptional({ enum: ['billable', 'report_only'] })
  @IsOptional()
  @IsEnum(['billable', 'report_only'] as const)
  waterDifferenceMode?: 'billable' | 'report_only';

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  @IsEnum(['active', 'inactive'] as const)
  status?: 'active' | 'inactive';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  areaId?: string;
}
