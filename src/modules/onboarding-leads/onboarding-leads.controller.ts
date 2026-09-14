import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { OnboardingLeadsService } from './onboarding-leads.service';
import { CreateOnboardingLeadDto } from './dto/create-onboarding-lead.dto';
import { QueryOnboardingLeadsDto } from './dto/query-onboarding-leads.dto';
import { UpdateOnboardingLeadStatusDto } from './dto/update-onboarding-lead-status.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/user-roles.decorator';
import { RolesGuard } from '../../common/guards/user-role.guard';
import { UserRole } from '../../common/enums';

@ApiTags('Onboarding Leads')
@Controller({ path: 'onboarding-leads', version: '1' })
export class OnboardingLeadsController {
  constructor(
    private readonly onboardingLeadsService: OnboardingLeadsService,
  ) {}

  @Public()
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Submit an onboarding lead (public)' })
  create(@Body() dto: CreateOnboardingLeadDto) {
    return this.onboardingLeadsService.create(dto);
  }

  @Get('summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get lead status counts (super-admin)' })
  getSummary() {
    return this.onboardingLeadsService.getSummary();
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'List all onboarding leads (super-admin)' })
  findAll(@Query() query: QueryOnboardingLeadsDto) {
    return this.onboardingLeadsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get a single onboarding lead (super-admin)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.onboardingLeadsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update lead status (super-admin)' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOnboardingLeadStatusDto,
  ) {
    return this.onboardingLeadsService.updateStatus(id, dto);
  }
}
