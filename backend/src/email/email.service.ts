import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

export interface EmailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null = null;
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 1000;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Email service configured (Resend)');
    } else {
      this.logger.warn('RESEND_API_KEY not configured — emails will be logged only');
    }
  }

  isConfigured(): boolean {
    return this.resend !== null;
  }

  async send(message: EmailMessage): Promise<{ id: string; status: string }> {
    const id = `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (!this.resend) {
      const isProduction = process.env.NODE_ENV === 'production';

      if (isProduction) {
        // Never silently drop email in production — a user asking for a password
        // reset must not be told "check your inbox" when no email was sent.
        this.logger.error('Email service is not configured in production — refusing to silently drop email');
        throw new InternalServerErrorException('Email service is not configured');
      }

      this.logger.debug({ id, to: message.to, subject: message.subject }, 'Email dry-run');
      return { id, status: 'DRY_RUN' };
    }

    const from = process.env.SMTP_FROM ?? 'GradTure <noreply@gradture.ai>';

    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
      const result = await this.resend.emails.send({
        from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      } as any);

        this.logger.debug({ id, messageId: result.data?.id, to: message.to, attempt }, 'Email sent');
        return { id, status: 'SENT' };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn({ id, attempt, error: lastError.message }, 'Email send failed, retrying');
        if (attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs * attempt));
        }
      }
    }

    this.logger.error({ id, to: message.to, subject: message.subject, error: lastError?.message }, 'Email send failed after retries');
    throw new InternalServerErrorException('Failed to send email after retries');
  }
}
