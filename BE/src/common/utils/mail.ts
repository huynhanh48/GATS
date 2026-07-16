import fs from 'fs';
import path from 'path';

import nodemailer from 'nodemailer';

import EnvVars from '../constants/env';

type TemplateData = Record<string, string | number>;

const APP_NAME = 'GATS Academy';

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: EnvVars.EmailUser,
        pass: EnvVars.EmailPassword,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    return this.transporter.sendMail({
      from: EnvVars.EmailUser,
      to,
      subject,
      text,
    });
  }

  async sendEmailWithTemplate(
    to: string,
    subject: string,
    templateName: string,
    data: TemplateData,
  ) {
    const html = this.renderTemplate(templateName, data);
    return this.transporter.sendMail({
      from: EnvVars.EmailUser,
      to,
      subject,
      html,
    });
  }

  async sendVerificationEmail(input: {
    to: string;
    userName: string;
    verifyUrl: string;
  }) {
    return this.sendEmailWithTemplate(
      input.to,
      'Xác thực email - GATS Academy',
      'verify-email.html',
      {
        appName: APP_NAME,
        userName: input.userName,
        verifyUrl: input.verifyUrl,
        year: new Date().getFullYear(),
      },
    );
  }

  renderTemplate(templateName: string, data: TemplateData): string {
    const html = this.loadTemplate(templateName);
    return this.interpolate(html, data);
  }

  loadTemplate(templateName: string): string {
    const templatePath = path.join(__dirname, '../../templates', templateName);
    return fs.readFileSync(templatePath, 'utf8');
  }

  private interpolate(html: string, data: TemplateData): string {
    return Object.entries(data).reduce(
      (result, [key, value]) =>
        result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value)),
      html,
    );
  }
}

export const mailService = new MailService();
