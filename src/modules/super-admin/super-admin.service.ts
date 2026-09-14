import { Injectable } from '@nestjs/common';
import { SuperAdminAction } from './actions/super-admin.action';
import { PaginationDto } from '../../common/dto/pagination.do';
import { UserRole } from '../../common/enums';
import { FeedbackService } from '../feedback/feedback.service';
import { OnboardingLeadsService } from '../onboarding-leads/onboarding-leads.service';
import { UsersService } from '../users/users.service';
import { QueryOnboardingLeadsDto } from '../onboarding-leads/dto/query-onboarding-leads.dto';
import { UpdateOnboardingLeadStatusDto } from '../onboarding-leads/dto/update-onboarding-lead-status.dto';
import { QueryFeedbackDto } from '../feedback/dto/query-feedback.dto';
import { UpdateFeedbackDto } from '../feedback/dto/update-feedback.dto';
import { QuerySuperAdminUsersDto } from '../users/dto/query-super-admin-users.dto';
import { ToggleUserStatusDto } from '../users/dto/toggle-user-status.dto';
import { QueryAdminUsersDto } from '../users/dto/query-admin-users.dto';
import { CreateAdminDto } from '../users/dto/create-admin.dto';
import { UpdateAdminRoleDto } from '../users/dto/update-admin-role.dto';
import { UpdateAdminStatusDto } from '../users/dto/update-admin-status.dto';

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly superAdminAction: SuperAdminAction,
    private readonly feedbackService: FeedbackService,
    private readonly onboardingLeadsService: OnboardingLeadsService,
    private readonly usersService: UsersService,
  ) {}

  async getDashboardSummary() {
    const userCounts = await this.superAdminAction.getUserCountSummary();

    const { total: totalFeedback, open: openFeedback, inProgress: inProgressFeedback, resolved: resolvedFeedback } = await this.feedbackService.getSummary();
    const { total: totalLeads, new: newLeads, contacted: contactedLeads, qualified: qualifiedLeads } = await this.onboardingLeadsService.getSummary();

    return {
      users: {
        total: userCounts.total,
        newThisMonth: userCounts.newThisMonth,
        // NOTE: free/paid counts require a subscriptions table — not yet implemented
        free: null,
        paid: null,
      },
      // NOTE: installers require an installer_profiles table — not yet implemented
      installers: null,
      leads: {
        total: totalLeads,
        new: newLeads,
        contacted: contactedLeads,
        qualified: qualifiedLeads,
      },
      feedback: {
        total: totalFeedback,
        open: openFeedback,
        inProgress: inProgressFeedback,
        resolved: resolvedFeedback,
      },
      // NOTE: aiUsage requires an ai_usage_events table — not yet implemented
      aiUsage: null,
    };
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
    const isActive = dto.status === 'active';
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
