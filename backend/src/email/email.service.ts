import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

export interface EmailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter | null = null;
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 1000;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log('Email service configured');
    } else {
      this.logger.warn('SMTP credentials not configured — emails will be logged only');
    }
  }

  async send(message: EmailMessage): Promise<{ id: string; status: string }> {
    const id = `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (!this.transporter) {
      this.logger.debug({ id, to: message.to, subject: message.subject }, 'Email dry-run');
      return { id, status: 'DRY_RUN' };
    }

    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.transporter.sendMail({
          from: process.env.SMTP_FROM ?? process.env.EMAIL_FROM ?? 'noreply@gradhire.ai',
          to: message.to,
          subject: message.subject,
          text: message.text,
          html: message.html,
        });

        this.logger.debug({ id, messageId: result.messageId, to: message.to, attempt }, 'Email sent');
        return { id, status: 'SENT' };
      } catch (error) {
        lastError = error as Error;
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
