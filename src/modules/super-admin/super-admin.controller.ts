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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/user-role.guard';
import { Roles } from '../../common/decorators/user-roles.decorator';
import { UserRole } from '../../common/enums';
import { SuperAdminService } from './super-admin.service';
import { PaginationDto } from '../../common/dto/pagination.do';
import { QueryOnboardingLeadsDto } from '../onboarding-leads/dto/query-onboarding-leads.dto';
import { UpdateOnboardingLeadStatusDto } from '../onboarding-leads/dto/update-onboarding-lead-status.dto';
import { QueryFeedbackDto } from '../feedback/dto/query-feedback.dto';
import { UpdateFeedbackDto } from '../feedback/dto/update-feedback.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { QuerySuperAdminUsersDto } from '../users/dto/query-super-admin-users.dto';
import { ToggleUserStatusDto } from '../users/dto/toggle-user-status.dto';
import { QueryAdminUsersDto } from '../users/dto/query-admin-users.dto';
import { CreateAdminDto } from '../users/dto/create-admin.dto';
import { UpdateAdminRoleDto } from '../users/dto/update-admin-role.dto';
import { UpdateAdminStatusDto } from '../users/dto/update-admin-status.dto';
import { QueryInstallersDto } from '../installers/dto/query-installers.dto';
import { UpdateInstallerStatusDto } from '../installers/dto/update-installer-status.dto';
import { CreateInstallerProfileDto } from '../installers/dto/create-installer-profile.dto';
import { UsersChartQueryDto } from './dto/users-chart-query.dto';

@ApiTags('Super Admin')
@ApiBearerAuth()
@Controller({ path: 'super-admin', version: '1' })
@Roles(UserRole.SUPER_ADMIN)
@UseGuards(RolesGuard)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('dashboard/summary')
  getSummary() {
    return this.superAdminService.getDashboardSummary();
  }

  @Get('dashboard/users-chart')
  getUsersChart(@Query() query: UsersChartQueryDto) {
    return this.superAdminService.getUsersChart(query);
  }

  @Get('dashboard/ai-usage-chart')
  getAiUsageChart() {}

  @Get('dashboard/recent-users')
  getRecentUsers(@Query() pagination: PaginationDto) {
    return this.superAdminService.getRecentUsers(pagination);
  }

  // ── Admins ───────────────────────────────────────────────────────────────────

  @Get('admins')
  listAdmins(@Query() query: QueryAdminUsersDto) {
    return this.superAdminService.listAdmins(query);
  }

  @Post('admins')
  createAdmin(@Body() dto: CreateAdminDto) {
    return this.superAdminService.createAdmin(dto);
  }

  @Patch('admins/:id/role')
  promoteAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminRoleDto,
  ) {
    return this.superAdminService.updateAdminRole(id, dto);
  }

  @Patch('admins/:id/status')
  toggleAdminStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminStatusDto,
  ) {
    return this.superAdminService.updateAdminStatus(id, dto);
  }

  @Get('admins/activity')
  getAdminActivity() {}

  // ── Users ────────────────────────────────────────────────────────────────────

  @Get('users')
  listUsers(@Query() query: QuerySuperAdminUsersDto) {
    return this.superAdminService.listUsers(query);
  }

  @Get('users/:id')
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.superAdminService.getUser(id);
  }

  @Patch('users/:id/status')
  toggleUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleUserStatusDto,
  ) {
    return this.superAdminService.toggleUserStatus(id, dto);
  }

  @Get('installers/summary')
  getInstallersSummary() {
    return this.superAdminService.getInstallersSummary();
  }

  @Get('installers')
  listInstallers(@Query() query: QueryInstallersDto) {
    return this.superAdminService.findInstallers(query);
  }

  @Get('installers/:id')
  getInstaller(@Param('id', ParseUUIDPipe) id: string) {
    return this.superAdminService.findInstaller(id);
  }

  @Patch('installers/:id/status')
  toggleInstallerStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInstallerStatusDto,
  ) {
    return this.superAdminService.updateInstallerStatus(id, dto);
  }

  @Post('installers')
  createInstaller(@Body() dto: CreateInstallerProfileDto) {
    return this.superAdminService.createInstallerProfile(dto);
  }

  // ── Onboarding leads ────────────────────────────────────────────────────────

  @Get('onboarding-leads/summary')
  getLeadsSummary() {
    return this.superAdminService.getOnboardingLeadsSummary();
  }

  @Get('onboarding-leads')
  listLeads(@Query() query: QueryOnboardingLeadsDto) {
    return this.superAdminService.findOnboardingLeads(query);
  }

  @Get('onboarding-leads/:id')
  getLead(@Param('id', ParseUUIDPipe) id: string) {
    return this.superAdminService.findOneLead(id);
  }

  @Patch('onboarding-leads/:id/status')
  toggleLeadQualification(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOnboardingLeadStatusDto,
  ) {
    return this.superAdminService.updateLeadStatus(id, dto);
  }

  // ── Feedback ─────────────────────────────────────────────────────────────────

  @Get('feedback/summary')
  getFeedbackSummary() {
    return this.superAdminService.getFeedbackSummary();
  }

  @Get('feedback')
  listFeedback(@Query() query: QueryFeedbackDto) {
    return this.superAdminService.findAllFeedback(query);
  }

  @Get('feedback/:id')
  getFeedback(@Param('id', ParseUUIDPipe) id: string) {
    return this.superAdminService.findOneFeedback(id);
  }

  @Patch('feedback/:id')
  patchFeedbackStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFeedbackDto,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.superAdminService.updateFeedback(id, dto, adminId);
  }
}
