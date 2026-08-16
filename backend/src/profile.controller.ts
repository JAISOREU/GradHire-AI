import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from './auth/auth.guard';
import { StudentGuard } from './auth/student.guard';
import { AuthUser } from './auth/auth.service';
import { AppService } from './app.service';
import { CreateEducationDto, UpdateEducationDto } from './common/dto/education.dto';
import { CreateExperienceDto, UpdateExperienceDto } from './common/dto/experience.dto';
import { CreateSkillDto, UpdateSkillDto } from './common/dto/skill.dto';
import { CreateCertificationDto, UpdateCertificationDto } from './common/dto/certification.dto';
import { CreateProjectDto, UpdateProjectDto } from './common/dto/project.dto';
import { UpdateCareerPreferenceDto } from './common/dto/career-preference.dto';

@Controller('profile')
@UseGuards(AuthGuard, StudentGuard)
export class ProfileController {
  constructor(private readonly appService: AppService) {}

  private userId(req: Request & { user: AuthUser }): string {
    return req.user.id;
  }

  // Education
  @Get('education')
  getEducation(@Req() req: Request & { user: AuthUser }) {
    return this.appService.getEducations(this.userId(req));
  }

  @Post('education')
  createEducation(@Req() req: Request & { user: AuthUser }, @Body() body: CreateEducationDto) {
    return this.appService.createEducation(this.userId(req), body as unknown as Record<string, unknown>);
  }

  @Put('education/:id')
  updateEducation(@Req() req: Request & { user: AuthUser }, @Param('id') id: string, @Body() body: UpdateEducationDto) {
    return this.appService.updateEducation(this.userId(req), id, body as unknown as Record<string, unknown>);
  }

  @Delete('education/:id')
  deleteEducation(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.appService.deleteEducation(this.userId(req), id);
  }

  // Experience
  @Get('experience')
  getExperience(@Req() req: Request & { user: AuthUser }) {
    return this.appService.getExperiences(this.userId(req));
  }

  @Post('experience')
  createExperience(@Req() req: Request & { user: AuthUser }, @Body() body: CreateExperienceDto) {
    return this.appService.createExperience(this.userId(req), body as unknown as Record<string, unknown>);
  }

  @Put('experience/:id')
  updateExperience(@Req() req: Request & { user: AuthUser }, @Param('id') id: string, @Body() body: UpdateExperienceDto) {
    return this.appService.updateExperience(this.userId(req), id, body as unknown as Record<string, unknown>);
  }

  @Delete('experience/:id')
  deleteExperience(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.appService.deleteExperience(this.userId(req), id);
  }

  // Skills
  @Get('skills')
  getSkills(@Req() req: Request & { user: AuthUser }) {
    return this.appService.getSkills(this.userId(req));
  }

  @Post('skills')
  createSkill(@Req() req: Request & { user: AuthUser }, @Body() body: CreateSkillDto) {
    return this.appService.createSkill(this.userId(req), body as unknown as Record<string, unknown>);
  }

  @Delete('skills/:id')
  deleteSkill(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.appService.deleteSkill(this.userId(req), id);
  }

  // Certifications
  @Get('certifications')
  getCertifications(@Req() req: Request & { user: AuthUser }) {
    return this.appService.getCertifications(this.userId(req));
  }

  @Post('certifications')
  createCertification(@Req() req: Request & { user: AuthUser }, @Body() body: CreateCertificationDto) {
    return this.appService.createCertification(this.userId(req), body as unknown as Record<string, unknown>);
  }

  @Put('certifications/:id')
  updateCertification(@Req() req: Request & { user: AuthUser }, @Param('id') id: string, @Body() body: UpdateCertificationDto) {
    return this.appService.updateCertification(this.userId(req), id, body as unknown as Record<string, unknown>);
  }

  @Delete('certifications/:id')
  deleteCertification(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.appService.deleteCertification(this.userId(req), id);
  }

  // Projects
  @Get('projects')
  getProjects(@Req() req: Request & { user: AuthUser }) {
    return this.appService.getProjects(this.userId(req));
  }

  @Post('projects')
  createProject(@Req() req: Request & { user: AuthUser }, @Body() body: CreateProjectDto) {
    return this.appService.createProject(this.userId(req), body as unknown as Record<string, unknown>);
  }

  @Put('projects/:id')
  updateProject(@Req() req: Request & { user: AuthUser }, @Param('id') id: string, @Body() body: UpdateProjectDto) {
    return this.appService.updateProject(this.userId(req), id, body as unknown as Record<string, unknown>);
  }

  @Delete('projects/:id')
  deleteProject(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.appService.deleteProject(this.userId(req), id);
  }

  // Career Preferences
  @Get('preferences')
  getPreferences(@Req() req: Request & { user: AuthUser }) {
    return this.appService.getCareerPreference(this.userId(req));
  }

  @Put('preferences')
  updatePreferences(@Req() req: Request & { user: AuthUser }, @Body() body: UpdateCareerPreferenceDto) {
    return this.appService.upsertCareerPreference(this.userId(req), body as unknown as Record<string, unknown>);
  }

  // Completeness & AI Readiness
  @Get('completeness')
  getCompleteness(@Req() req: Request & { user: AuthUser }) {
    return this.appService.getProfileCompleteness(this.userId(req));
  }

  @Get('ai-readiness')
  getAiReadiness(@Req() req: Request & { user: AuthUser }) {
    return this.appService.getAiReadiness(this.userId(req));
  }
}
