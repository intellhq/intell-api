import { Injectable } from '@nestjs/common';
import { SuperAdminAction } from './actions/super-admin.action';
import { PaginationDto } from '../../common/dto/pagination.do';
import { UserRole } from '../../common/enums';
import { FeedbackService } from '../feedback/feedback.service';
import { OnboardingLeadsService } from '../onboarding-leads/onboarding-leads.service';
import { UsersService } from '../users/users.service';
import { SubscriptionModelAction } from '../users/actions/subscription.action';
import { InstallersService } from '../installers/installers.service';
import { QueryOnboardingLeadsDto } from '../onboarding-leads/dto/query-onboarding-leads.dto';
import { UpdateOnboardingLeadStatusDto } from '../onboarding-leads/dto/update-onboarding-lead-status.dto';
import { QueryFeedbackDto } from '../feedback/dto/query-feedback.dto';
import { UpdateFeedbackDto } from '../feedback/dto/update-feedback.dto';
import { QuerySuperAdminUsersDto } from '../users/dto/query-super-admin-users.dto';
import {
  ToggleUserStatusDto,
  UserActiveStatus,
} from '../users/dto/toggle-user-status.dto';
import { QueryAdminUsersDto } from '../users/dto/query-admin-users.dto';
import { CreateAdminDto } from '../users/dto/create-admin.dto';
import { UpdateAdminRoleDto } from '../users/dto/update-admin-role.dto';
import { UpdateAdminStatusDto } from '../users/dto/update-admin-status.dto';
import { QueryInstallersDto } from '../installers/dto/query-installers.dto';
import { UpdateInstallerStatusDto } from '../installers/dto/update-installer-status.dto';
import { CreateInstallerProfileDto } from '../installers/dto/create-installer-profile.dto';
import { ChartPeriod, UsersChartQueryDto } from './dto/users-chart-query.dto';

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly superAdminAction: SuperAdminAction,
    private readonly subscriptionAction: SubscriptionModelAction,
    private readonly feedbackService: FeedbackService,
    private readonly onboardingLeadsService: OnboardingLeadsService,
    private readonly usersService: UsersService,
    private readonly installersService: InstallersService,
  ) {}

  async getDashboardSummary() {
    const [
      userCounts,
      planCounts,
      feedbackSummary,
      leadsSummary,
      installerSummary,
    ] = await Promise.all([
      this.superAdminAction.getUserCountSummary(),
      this.subscriptionAction.getPlanCounts(),
      this.feedbackService.getSummary(),
      this.onboardingLeadsService.getSummary(),
      this.installersService.getSummary(),
    ]);

    return {
      users: {
        total: userCounts.total,
        newThisMonth: userCounts.newThisMonth,
        free: planCounts.free,
        paid: planCounts.paid,
      },
      installers: {
        total: installerSummary.total,
        partners: installerSummary.partners,
        technicians: installerSummary.technicians,
      },
      leads: {
        total: leadsSummary.total,
        new: leadsSummary.new,
        contacted: leadsSummary.contacted,
        qualified: leadsSummary.qualified,
      },
      feedback: {
        total: feedbackSummary.total,
        open: feedbackSummary.open,
        inProgress: feedbackSummary.inProgress,
        resolved: feedbackSummary.resolved,
      },
      // NOTE: aiUsage requires an ai_usage_events table — not yet implemented
      aiUsage: null,
    };
  }

  async getUsersChart(query: UsersChartQueryDto) {
    const period = query.period ?? ChartPeriod.MONTHLY;
    const points = await this.subscriptionAction.getPlanCountsByPeriod(
      period,
      query.startDate,
      query.endDate,
    );
    return { period, points };
  }

  async getRecentUsers(pagination: PaginationDto) {
    const limit = pagination.limit ?? 10;
    const page = pagination.page ?? 1;

    return this.superAdminAction.list({
      filterRecordOptions: { role: UserRole.USER },
      paginationPayload: { page, limit },
      order: { createdAt: 'DESC' },
    });
  }

  // ── Users ────────────────────────────────────────────────────────────────────

  listUsers(query: QuerySuperAdminUsersDto) {
    return this.usersService.adminListUsers(query);
  }

  getUser(id: string) {
    return this.usersService.adminGetUser(id);
  }

  toggleUserStatus(id: string, dto: ToggleUserStatusDto) {
    const isActive = dto.status === UserActiveStatus.ACTIVE;
    return this.usersService.adminToggleUserStatus(id, isActive);
  }

  // ── Admins ───────────────────────────────────────────────────────────────────

  listAdmins(query: QueryAdminUsersDto) {
    return this.usersService.adminListAdmins(query);
  }

  createAdmin(dto: CreateAdminDto) {
    return this.usersService.adminCreateAdmin(dto);
  }

  updateAdminRole(id: string, dto: UpdateAdminRoleDto) {
    return this.usersService.adminUpdateAdminRole(id, dto.role);
  }

  updateAdminStatus(id: string, dto: UpdateAdminStatusDto) {
    return this.usersService.adminUpdateAdminStatus(id, dto.status);
  }

  // ── Installers ───────────────────────────────────────────────────────────────

  getInstallersSummary() {
    return this.installersService.getSummary();
  }

  findInstallers(query: QueryInstallersDto) {
    return this.installersService.findAll(query);
  }

  findInstaller(id: string) {
    return this.installersService.findOne(id);
  }

  updateInstallerStatus(id: string, dto: UpdateInstallerStatusDto) {
    return this.installersService.updateStatus(id, dto);
  }

  createInstallerProfile(dto: CreateInstallerProfileDto) {
    return this.installersService.createProfile(dto);
  }

  // ── Onboarding leads ────────────────────────────────────────────────────────

  getOnboardingLeadsSummary() {
    return this.onboardingLeadsService.getSummary();
  }

  findOnboardingLeads(query: QueryOnboardingLeadsDto) {
    return this.onboardingLeadsService.findAll(query);
  }

  findOneLead(id: string) {
    return this.onboardingLeadsService.findOne(id);
  }

  updateLeadStatus(id: string, dto: UpdateOnboardingLeadStatusDto) {
    return this.onboardingLeadsService.updateStatus(id, dto);
  }

  // ── Feedback ─────────────────────────────────────────────────────────────────

  getFeedbackSummary() {
    return this.feedbackService.getSummary();
  }

  findAllFeedback(query: QueryFeedbackDto) {
    return this.feedbackService.findAll(query);
  }

  findOneFeedback(id: string) {
    return this.feedbackService.findOne(id);
  }

  updateFeedback(id: string, dto: UpdateFeedbackDto, adminId: string) {
    return this.feedbackService.update(id, dto, adminId);
  }
}
