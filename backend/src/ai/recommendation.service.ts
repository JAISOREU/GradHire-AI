import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AiService, AiRecommendation } from '../ai/ai.service';

export interface RecommendationGatingResult {
  ready: boolean;
  missing: string[];
  checks: { key: string; required: boolean; ready: boolean }[];
  profileSummary: Record<string, unknown>;
}

export interface PersonalizedRecommendationsResult {
  ready: boolean;
  missing: string[];
  checks: { key: string; required: boolean; ready: boolean }[];
  recommendations: AiRecommendation[];
  profileSummary: Record<string, unknown>;
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(private readonly prisma: PrismaService, private readonly ai: AiService) {}

  async getPersonalizedRecommendations(userId: string, topK = 5): Promise<PersonalizedRecommendationsResult> {
    const gating = await this.checkReadiness(userId);

    if (!gating.ready) {
      return {
        ...gating,
        recommendations: [],
      };
    }

    let recommendations: AiRecommendation[] = [];

    try {
      recommendations = await this.ai.getPersonalizedRecommendations(gating.profileSummary, topK);
    } catch (error) {
      this.logger.warn(`AI recommendations failed for user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    }

    if (!recommendations.length) {
      try {
        recommendations = await this.ai.getHeuristicRecommendations(gating.profileSummary, topK);
      } catch (error) {
        this.logger.warn(`Heuristic recommendations failed for user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return {
      ...gating,
      recommendations,
    };
  }

  async checkReadiness(userId: string): Promise<RecommendationGatingResult> {
    const profile = await this.prisma.profile.findFirst({ where: { userId } });
    if (!profile) {
      return {
        ready: false,
        missing: ['profile'],
        checks: [],
        profileSummary: {},
      };
    }

    const checks: { key: string; required: boolean; ready: boolean }[] = [];
    const missing: string[] = [];

    const education = await this.prisma.education.findFirst({ where: { userId } });
    const hasEducation = education !== null;
    checks.push({ key: 'Education', required: true, ready: hasEducation });
    if (!hasEducation) missing.push('education');

    const skills = await this.prisma.skill.findFirst({ where: { userId } });
    const hasSkills = skills !== null;
    checks.push({ key: 'Skills', required: true, ready: hasSkills });
    if (!hasSkills) missing.push('skills');

    const experience = await this.prisma.experience.findFirst({ where: { userId } });
    const hasExperience = experience !== null;
    checks.push({ key: 'Experience', required: true, ready: hasExperience });
    if (!hasExperience) missing.push('experience');

    const resume = await this.prisma.resume.findFirst({ where: { userId } });
    const hasResume = resume !== null;
    checks.push({ key: 'Resume', required: false, ready: hasResume });
    if (!hasResume) missing.push('resume');

    const preferences = await this.prisma.careerPreference.findFirst({ where: { userId } });
    const hasPreferences = preferences !== null;
    checks.push({ key: 'Career Preferences', required: false, ready: hasPreferences });
    if (!hasPreferences) missing.push('career_preferences');

    const ready = checks.filter((c) => c.required).every((c) => c.ready);

    return {
      ready,
      missing,
      checks,
      profileSummary: {
        id: profile.id,
        name: profile.name,
        focus: profile.focus,
        summary: profile.summary,
        skills: profile.skills,
        education: profile.education,
        experience: profile.experience,
        location: profile.location,
        availability: profile.availability,
        workAuthorization: profile.workAuthorization,
        authorizedCountries: profile.authorizedCountries,
        needsVisaSponsorship: profile.needsVisaSponsorship,
        studentFriendly: profile.studentFriendly,
        freshGraduate: profile.freshGraduate,
        graduationYear: profile.graduationYear,
        degree: profile.degree,
        fieldOfStudy: profile.fieldOfStudy,
        internshipAccepted: profile.internshipAccepted,
        expectedSalary: profile.expectedSalary,
        hasEducation,
        hasSkills,
        hasExperience,
        hasResume,
        hasPreferences,
      },
    };
  }
}
