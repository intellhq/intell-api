import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InstallersService } from './installers.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Installers')
@ApiBearerAuth()
@Controller({ path: 'installers', version: '1' })
export class InstallersController {
  constructor(private readonly installersService: InstallersService) {}

  /**
   * List all active installer assignments for an inverter.
   * The requesting user must be the inverter owner.
   *
   * GET /api/v1/installers/:id/assignments
   *   :id — inverterId
   */
  @Get(':id/assignments')
  @ApiOperation({ summary: 'List active installer assignments for an inverter' })
  getAssignments(
    @Param('id', ParseUUIDPipe) inverterId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.installersService.getAssignmentsForInverter(inverterId, userId);
  }

  /**
   * Assign an installer profile to an inverter.
   * The requesting user must be the inverter owner.
   * The inverterId in the URL takes precedence over any value in the body.
   *
   * POST /api/v1/installers/:id/assignments
   *   :id — inverterId
   */
  @Post(':id/assignments')
  @ApiOperation({ summary: 'Assign an installer to an inverter' })
  createAssignment(
    @Param('id', ParseUUIDPipe) inverterId: string,
    @Body() dto: CreateAssignmentDto,
    @CurrentUser('sub') userId: string,
  ) {
    // Bind inverterId from the route param so the caller cannot target a
    // different inverter than the one named in the URL.
    return this.installersService.createAssignment(
      { ...dto, inverterId },
      userId,
    );
  }

  /**
   * Revoke an active installer assignment.
   * The requesting user must be the inverter owner.
   *
   * DELETE /api/v1/installers/:id/assignments/:assignmentId
   *   :id           — inverterId (used for the ownership check inside the service)
   *   :assignmentId — the assignment to revoke
   */
  @Delete(':id/assignments/:assignmentId')
  @ApiOperation({ summary: 'Revoke an installer assignment' })
  revokeAssignment(
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.installersService.revokeAssignment(assignmentId, userId);
  }
}
