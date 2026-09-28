import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { QueryFeedbackDto } from './dto/query-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/user-roles.decorator';
import { RolesGuard } from '../../common/guards/user-role.guard';
import { UseGuards } from '@nestjs/common';
import { UserRole } from '../../common/enums';

@ApiTags('Feedback')
@ApiBearerAuth()
@Controller({ path: 'feedback', version: '1' })
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Submit feedback (authenticated users)' })
  create(
    @Body() dto: CreateFeedbackDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    // name is resolved inside the service via the user record when needed
    return this.feedbackService.create(dto, currentUser);
  }

  @Get('summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get feedback status counts (super-admin)' })
  getSummary() {
    return this.feedbackService.getSummary();
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'List all feedback (super-admin)' })
  findAll(@Query() query: QueryFeedbackDto) {
    return this.feedbackService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get single feedback record (super-admin)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update feedback status / priority / note (super-admin)',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFeedbackDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.feedbackService.update(id, dto, adminId);
  }
}
