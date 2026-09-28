import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { FeedbackPriority } from '../../../common/enums/feedback-priority.enum';

export class CreateFeedbackDto {
  @ApiProperty({ example: 'Billing or savings report' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  category: string;

  @ApiProperty({ enum: FeedbackPriority, example: FeedbackPriority.MEDIUM })
  @IsEnum(FeedbackPriority)
  priority: FeedbackPriority;

  @ApiProperty({ example: 'The savings forecast needs clearer explanation.' })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message: string;

  // @ApiPropertyOptional()
  // reserved for anonymous/future use — backend infers from JWT when authenticated
}
