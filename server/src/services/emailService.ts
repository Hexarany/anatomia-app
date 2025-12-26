import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import sgMail from '@sendgrid/mail'
import { Resend } from 'resend'

// Email configuration interface
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// Email options interface
interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: Transporter | null = null
  private from: string
  private useSendGrid: boolean = false
  private sendGridConfigured: boolean = false
  private resendClient: Resend | null = null
  private useResend: boolean = false

  constructor() {
    this.from = process.env.EMAIL_FROM || process.env.SENDGRID_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'noreply@anatomia.app'
    this.initializeEmailService()
  }

  private initializeEmailService() {
    const emailService = process.env.EMAIL_SERVICE || 'smtp'

    if (emailService === 'resend') {
      this.initializeResend()
    } else if (emailService === 'sendgrid') {
      this.initializeSendGrid()
    } else {
      this.initializeSmtp()
    }
  }

  private initializeResend() {
    try {
      const apiKey = process.env.RESEND_API_KEY

      if (!apiKey) {
        console.warn('⚠️  Resend API key not configured. Email notifications will be disabled.')
        return
      }

      this.resendClient = new Resend(apiKey)
      this.useResend = true
      this.from = process.env.RESEND_FROM_EMAIL || this.from

      console.log('✅ Email service initialized (Resend)')
    } catch (error) {
      console.error('❌ Failed to initialize Resend:', error)
    }
  }

  private initializeSendGrid() {
    try {
      const apiKey = process.env.SENDGRID_API_KEY

      if (!apiKey) {
        console.warn('⚠️  SendGrid API key not configured. Email notifications will be disabled.')
        return
      }

      sgMail.setApiKey(apiKey)
      this.useSendGrid = true
      this.sendGridConfigured = true
      this.from = process.env.SENDGRID_FROM_EMAIL || this.from

      console.log('✅ Email service initialized (SendGrid)')
    } catch (error) {
      console.error('❌ Failed to initialize SendGrid:', error)
    }
  }

  private initializeSmtp() {
    try {
      const config: EmailConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASSWORD || '',
        },
      }

      // Check if email credentials are configured
      if (!config.auth.user || !config.auth.pass) {
        console.warn('⚠️  SMTP credentials not configured. Email notifications will be disabled.')
        return
      }

      this.transporter = nodemailer.createTransport(config)
      console.log('✅ Email service initialized (SMTP)')
    } catch (error) {
      console.error('❌ Failed to initialize SMTP email service:', error)
    }
  }

  // Send email
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (this.useResend && this.resendClient) {
      return this.sendEmailWithResend(options)
    }

    if (this.useSendGrid && this.sendGridConfigured) {
      return this.sendEmailWithSendGrid(options)
    }

    if (!this.transporter) {
      console.warn('Email service not configured. Skipping email to:', options.to)
      return false
    }

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })
      console.log(`✅ Email sent to ${options.to}: ${options.subject}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to send email to ${options.to}:`, error)
      return false
    }
  }

  private async sendEmailWithResend(options: SendEmailOptions): Promise<boolean> {
    if (!this.resendClient) return false

    try {
      await this.resendClient.emails.send({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      })
      console.log(`✅ Email sent via Resend to ${options.to}: ${options.subject}`)
      return true
    } catch (error: any) {
      console.error(`❌ Failed to send email via Resend to ${options.to}:`, error)
      return false
    }
  }

  private async sendEmailWithSendGrid(options: SendEmailOptions): Promise<boolean> {
    try {
      const msg = {
        to: options.to,
        from: {
          email: this.from.includes('<') ? this.from.match(/<(.+)>/)?.[1] || this.from : this.from,
          name: process.env.SENDGRID_FROM_NAME || 'Anatomia App'
        },
        subject: options.subject,
        html: options.html,
        text: options.text,
      }

      await sgMail.send(msg)
      console.log(`✅ Email sent via SendGrid to ${options.to}: ${options.subject}`)
      return true
    } catch (error: any) {
      console.error(`❌ Failed to send email via SendGrid to ${options.to}:`, error)
      if (error.response) {
        console.error('SendGrid error details:', error.response.body)
      }
      return false
    }
  }

  // Template: New Assignment
  async sendNewAssignmentEmail(
    to: string,
    studentName: string,
    assignmentTitle: string,
    deadline: Date,
    description: string,
    language: 'ru' | 'ro' = 'ru'
  ): Promise<boolean> {
    const isRussian = language === 'ru'

    const subject = isRussian
      ? `📝 Новое домашнее задание: ${assignmentTitle}`
      : `📝 Temă nouă: ${assignmentTitle}`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .deadline { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 Anatomia Interactive</h1>
      <p>${isRussian ? 'Новое домашнее задание' : 'Temă nouă'}</p>
    </div>
    <div class="content">
      <p>${isRussian ? 'Здравствуйте' : 'Bună ziua'}, ${studentName}!</p>

      <div class="card">
        <h2 style="color: #667eea; margin-top: 0;">📝 ${assignmentTitle}</h2>
        <p>${description}</p>
      </div>

      <div class="deadline">
        <strong>⏰ ${isRussian ? 'Срок сдачи' : 'Termen limită'}:</strong><br>
        ${deadline.toLocaleDateString(isRussian ? 'ru-RU' : 'ro-RO', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>

      <a href="${process.env.CLIENT_URL}/assignments" class="button">
        ${isRussian ? '📖 Открыть задание' : '📖 Deschide tema'}
      </a>

      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        ${isRussian
          ? 'Вы также можете сдать задание через Telegram бот @MateevMassageBot командой /submit'
          : 'De asemenea, puteți trimite tema prin botul Telegram @MateevMassageBot folosind comanda /submit'}
      </p>
    </div>
    <div class="footer">
      <p>${isRussian ? 'С уважением' : 'Cu stimă'},<br>Anatomia Interactive Team</p>
      <p style="margin-top: 10px;">
        ${isRussian ? 'Это автоматическое письмо. Пожалуйста, не отвечайте на него.' : 'Acesta este un e-mail automat. Vă rugăm să nu răspundeți.'}
      </p>
    </div>
  </div>
</body>
</html>
    `

    return this.sendEmail({ to, subject, html })
  }

  // Template: Grade Received
  async sendGradeEmail(
    to: string,
    studentName: string,
    assignmentTitle: string,
    score: number,
    maxScore: number,
    comment: string,
    language: 'ru' | 'ro' = 'ru'
  ): Promise<boolean> {
    const isRussian = language === 'ru'
    const percentage = Math.round((score / maxScore) * 100)

    const subject = isRussian
      ? `⭐ Оценка получена: ${assignmentTitle}`
      : `⭐ Notă primită: ${assignmentTitle}`

    // Determine emoji based on percentage
    let emoji = '📝'
    if (percentage >= 90) emoji = '🌟'
    else if (percentage >= 75) emoji = '✅'
    else if (percentage >= 60) emoji = '📝'
    else emoji = '📌'

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .score-card { background: white; padding: 30px; margin: 20px 0; border-radius: 8px; text-align: center; border: 2px solid #f5576c; }
    .score { font-size: 48px; font-weight: bold; color: #f5576c; margin: 10px 0; }
    .percentage { font-size: 24px; color: #666; }
    .comment-box { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }
    .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 Anatomia Interactive</h1>
      <p>${isRussian ? 'Ваша работа проверена' : 'Lucrarea dvs. a fost verificată'}</p>
    </div>
    <div class="content">
      <p>${isRussian ? 'Здравствуйте' : 'Bună ziua'}, ${studentName}!</p>

      <p>${isRussian
        ? 'Ваша работа по заданию <strong>' + assignmentTitle + '</strong> была проверена.'
        : 'Lucrarea dvs. pentru tema <strong>' + assignmentTitle + '</strong> a fost verificată.'}</p>

      <div class="score-card">
        <div style="font-size: 60px; margin-bottom: 10px;">${emoji}</div>
        <div class="score">${score} / ${maxScore}</div>
        <div class="percentage">${percentage}%</div>
      </div>

      ${comment ? `
      <div class="comment-box">
        <h3 style="margin-top: 0; color: #1976d2;">💬 ${isRussian ? 'Комментарий преподавателя' : 'Comentariul profesorului'}:</h3>
        <p style="margin: 0;">${comment}</p>
      </div>
      ` : ''}

      <a href="${process.env.CLIENT_URL}/assignments" class="button">
        ${isRussian ? '📊 Посмотреть детали' : '📊 Vizualizare detalii'}
      </a>
    </div>
    <div class="footer">
      <p>${isRussian ? 'С уважением' : 'Cu stimă'},<br>Anatomia Interactive Team</p>
    </div>
  </div>
</body>
</html>
    `

    return this.sendEmail({ to, subject, html })
  }

  // Template: Schedule Update
  async sendScheduleUpdateEmail(
    to: string,
    studentName: string,
    lessonTitle: string,
    oldDate: Date,
    newDate: Date,
    reason: string,
    language: 'ru' | 'ro' = 'ru'
  ): Promise<boolean> {
    const isRussian = language === 'ru'

    const subject = isRussian
      ? `📅 Изменение в расписании: ${lessonTitle}`
      : `📅 Modificare în orar: ${lessonTitle}`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .date-change { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .old-date { text-decoration: line-through; color: #999; }
    .new-date { color: #fa709a; font-weight: bold; font-size: 18px; }
    .reason-box { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 Anatomia Interactive</h1>
      <p>${isRussian ? 'Изменение в расписании' : 'Modificare în orar'}</p>
    </div>
    <div class="content">
      <p>${isRussian ? 'Здравствуйте' : 'Bună ziua'}, ${studentName}!</p>

      <p>${isRussian
        ? 'Информируем вас об изменении в расписании занятий.'
        : 'Vă informăm despre o modificare în orarul lecțiilor.'}</p>

      <div class="date-change">
        <h3 style="color: #fa709a; margin-top: 0;">📖 ${lessonTitle}</h3>

        <p><strong>${isRussian ? 'Было' : 'Era'}:</strong><br>
        <span class="old-date">${oldDate.toLocaleDateString(isRussian ? 'ru-RU' : 'ro-RO', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</span></p>

        <p><strong>${isRussian ? 'Стало' : 'Devine'}:</strong><br>
        <span class="new-date">${newDate.toLocaleDateString(isRussian ? 'ru-RU' : 'ro-RO', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</span></p>
      </div>

      ${reason ? `
      <div class="reason-box">
        <strong>${isRussian ? 'Причина' : 'Motiv'}:</strong><br>
        ${reason}
      </div>
      ` : ''}

      <p style="margin-top: 20px;">
        ${isRussian
          ? 'Пожалуйста, учтите это изменение при планировании.'
          : 'Vă rugăm să țineți cont de această modificare la planificare.'}
      </p>
    </div>
    <div class="footer">
      <p>${isRussian ? 'С уважением' : 'Cu stimă'},<br>Anatomia Interactive Team</p>
    </div>
  </div>
</body>
</html>
    `

    return this.sendEmail({ to, subject, html })
  }

  // Template: Welcome Email
  async sendWelcomeEmail(
    to: string,
    name: string,
    language: 'ru' | 'ro' = 'ru'
  ): Promise<boolean> {
    const isRussian = language === 'ru'

    const subject = isRussian
      ? '🎉 Добро пожаловать в Anatomia Interactive!'
      : '🎉 Bine ați venit la Anatomia Interactive!'

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ${isRussian ? 'Добро пожаловать!' : 'Bine ați venit!'}</h1>
      <p style="font-size: 18px; margin: 10px 0 0 0;">Anatomia Interactive</p>
    </div>
    <div class="content">
      <p>${isRussian ? 'Здравствуйте' : 'Bună ziua'}, ${name}!</p>

      <p>${isRussian
        ? 'Рады приветствовать вас на платформе Anatomia Interactive — современной образовательной платформе для изучения анатомии!'
        : 'Ne bucurăm să vă primim pe platforma Anatomia Interactive — platforma educațională modernă pentru studiul anatomiei!'}</p>

      <h3>${isRussian ? 'Что вы можете делать' : 'Ce puteți face'}:</h3>

      <div class="feature">
        📚 ${isRussian ? 'Изучать анатомию по категориям' : 'Studiați anatomia pe categorii'}
      </div>
      <div class="feature">
        🎯 ${isRussian ? 'Проходить тесты и викторины' : 'Rezolvați teste și quizuri'}
      </div>
      <div class="feature">
        🎨 ${isRussian ? 'Просматривать 3D модели' : 'Vizualizați modele 3D'}
      </div>
      <div class="feature">
        💬 ${isRussian ? 'Общаться в Telegram группах' : 'Comunicați în grupuri Telegram'}
      </div>
      <div class="feature">
        📝 ${isRussian ? 'Выполнять домашние задания' : 'Îndepliniți temele'}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}" class="button">
          ${isRussian ? '🚀 Начать обучение' : '🚀 Începe învățarea'}
        </a>
        <a href="https://t.me/MateevMassageBot" class="button" style="background: #0088cc;">
          ${isRussian ? '💬 Telegram бот' : '💬 Bot Telegram'}
        </a>
      </div>

      <p style="margin-top: 30px; color: #666;">
        ${isRussian
          ? 'Если у вас есть вопросы, свяжитесь с нами через Telegram бот или на платформе.'
          : 'Dacă aveți întrebări, contactați-ne prin botul Telegram sau pe platformă.'}
      </p>
    </div>
    <div class="footer">
      <p>${isRussian ? 'Успехов в обучении' : 'Succes la învățătură'}!<br>Anatomia Interactive Team</p>
    </div>
  </div>
</body>
</html>
    `

    return this.sendEmail({ to, subject, html })
  }

  // Template: Password Reset
  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetUrl: string,
    language: 'ru' | 'ro' = 'ru'
  ): Promise<boolean> {
    const isRussian = language === 'ru'
    const recipientName = name || (isRussian ? 'друг' : 'prieten')

    const subject = isRussian
      ? 'Сброс пароля'
      : 'Resetare parola'

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isRussian ? 'Сброс пароля' : 'Resetare parola'}</h1>
    </div>
    <div class="content">
      <p>${isRussian ? 'Здравствуйте' : 'Bună ziua'}, ${recipientName}!</p>
      <p>${isRussian
        ? 'Мы получили запрос на смену пароля. Нажмите кнопку ниже, чтобы установить новый пароль.'
        : 'Am primit o cerere de schimbare a parolei. Apăsați butonul de mai jos pentru a seta o parolă nouă.'}</p>

      <a href="${resetUrl}" class="button">
        ${isRussian ? 'Сменить пароль' : 'Schimbă parola'}
      </a>

      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        ${isRussian
          ? 'Если вы не запрашивали смену пароля, просто проигнорируйте это письмо.'
          : 'Dacă nu ați solicitat schimbarea parolei, ignorați acest mesaj.'}
      </p>
    </div>
    <div class="footer">
      <p>Anatomia Interactive Team</p>
    </div>
  </div>
</body>
</html>
    `

    return this.sendEmail({ to, subject, html })
  }

  /**
   * Send custom email to user(s)
   * For admin messaging functionality
   */
  async sendCustomEmail(
    to: string | string[],
    subject: string,
    message: string,
    language: 'ru' | 'ro' = 'ru'
  ): Promise<boolean> {
    const isRussian = language === 'ru'

    // Convert message to HTML with line breaks
    const formattedMessage = message.replace(/\n/g, '<br>')

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .message { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 ${subject}</h1>
    </div>
    <div class="content">
      <p>${isRussian ? 'Здравствуйте' : 'Salut'}!</p>

      <div class="message">
        ${formattedMessage}
      </div>

      <p style="margin-top: 30px; color: #666;">
        ${isRussian
          ? 'Это сообщение отправлено администратором платформы Anatomia Interactive.'
          : 'Acest mesaj a fost trimis de administratorul platformei Anatomia Interactive.'}
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          ${isRussian ? '🚀 Перейти на платформу' : '🚀 Mergi pe platformă'}
        </a>
      </div>
    </div>
    <div class="footer">
      <p>Anatomia Interactive Team</p>
    </div>
  </div>
</body>
</html>
    `

    // If 'to' is an array, send to multiple recipients
    if (Array.isArray(to)) {
      const results = await Promise.all(
        to.map(email => this.sendEmail({ to: email, subject, html }))
      )
      return results.every(result => result)
    }

    return this.sendEmail({ to, subject, html })
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email service not configured')
      return false
    }

    try {
      await this.transporter.verify()
      console.log('✅ Email connection verified')
      return true
    } catch (error) {
      console.error('❌ Email connection failed:', error)
      return false
    }
  }
}

export default new EmailService()
