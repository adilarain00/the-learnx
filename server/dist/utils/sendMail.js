"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendMail = async (options) => {
    const isActivation = !!(options.activationUrl ||
        options.activationCode ||
        options.data?.activationCode);
    const activationCode = options.activationCode || options.data?.activationCode;
    const emailType = options.type || (isActivation ? "activation" : "general");
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        service: process.env.SMTP_SERVICE,
        secure: false,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASS,
        },
    });
    // Updated visual theme: purple brand (modern, accessible)
    const mainColor = "#2b0f6f";
    const cardBg = "#ffffff";
    const cardShadow = "0 6px 22px rgba(43,15,111,0.12)";
    const borderRadius = "14px";
    const accentColor = "#7c3aed";
    const mutedColor = "#6b7280";
    const borderColor = "#ede9fe";
    const successColor = "#10b981";
    const fontFamily = "'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    let html = "";
    // Account Activation Email with Code
    if (emailType === "activation" && activationCode) {
        html = `
      <div style="background: #f7f5ff; padding: 40px 0; font-family: ${fontFamily};">
        <div style="max-width: 680px; margin: auto; background: ${cardBg}; border-radius: ${borderRadius}; box-shadow: ${cardShadow}; border: 1px solid ${borderColor}; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #4c1d95 0%, ${accentColor} 100%); padding: 28px 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.3px;">LearnX</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0 0; font-size: 13px; letter-spacing: 0.2px;">Smart learning, delivered.</p>
          </div>
          <div style="padding: 36px 36px;">
            <h2 style="color: ${mainColor}; margin: 0 0 14px 0; font-size: 22px; font-weight: 700;">Verify your email to get started</h2>
            <p style="color: ${mutedColor}; font-size: 15px; line-height: 1.6; margin: 0 0 18px 0;">Hi <strong style="color: ${mainColor};">${options.name || "there"}</strong>,</p>
            <p style="color: ${mutedColor}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">Thank you for joining LearnX. Use the secure verification code below to confirm your email and activate your account. The code will expire shortly for your protection.</p>
            <div style="background: #fff; border-radius: 10px; padding: 22px; text-align: center; margin: 24px 0; border: 1px solid rgba(124,58,237,0.12);">
              <p style="color: ${mutedColor}; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Verification Code</p>
              <div style="display:inline-block; margin-top:8px; background: linear-gradient(180deg, rgba(124,58,237,0.08), rgba(124,58,237,0.02)); padding: 12px 18px; border-radius: 8px;">
                <span style="font-size: 28px; font-weight: 700; color: ${mainColor}; letter-spacing: 3px; font-family: 'Courier New', monospace;">${activationCode}</span>
              </div>
              <p style="color: ${mutedColor}; font-size: 13px; margin: 10px 0 0 0;">This code is valid for 5 minutes. If you didn't request this, safely ignore this message.</p>
            </div>
            <div style="padding: 12px; border-radius: 8px; background: rgba(124,58,237,0.06); margin: 20px 0; border-left: 4px solid rgba(124,58,237,0.14);">
              <p style="color: ${mainColor}; font-size: 13px; margin: 0; font-weight: 600;">Security reminder</p>
              <p style="color: ${mutedColor}; font-size: 13px; margin: 6px 0 0 0;">We will never ask for your password. If you didn't make this request, please contact support immediately.</p>
            </div>
            <p style="color: ${mutedColor}; font-size: 13px; line-height: 1.5; margin: 18px 0 0 0;">Need help? Contact our support team at <a href="mailto:support@LearnX.com" style="color: ${accentColor}; text-decoration: none; font-weight: 600;">support@learnx.com</a></p>
          </div>
          <div style="background: #fbf7ff; padding: 20px 28px; text-align: center; border-top: 1px solid ${borderColor};">
            <p style="color: #8b84b8; font-size: 13px; margin: 0 0 6px 0;">&copy; ${new Date().getFullYear()} LearnX. All rights reserved.</p>
            <p style="color: #bfb7e6; font-size: 12px; margin: 0;">This is an automated message — please do not reply.</p>
          </div>
        </div>
      </div>
    `;
    }
    // Account Activation Email with URL
    else if (emailType === "activation" && options.activationUrl) {
        html = `
      <div style="background: #f7f5ff; padding: 40px 0; font-family: ${fontFamily};">
        <div style="max-width: 680px; margin: auto; background: ${cardBg}; border-radius: ${borderRadius}; box-shadow: ${cardShadow}; border: 1px solid ${borderColor}; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #4c1d95 0%, ${accentColor} 100%); padding: 28px 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 26px; font-weight: 700;">LearnX</h1>
          </div>
          <div style="padding: 36px 36px;">
            <h2 style="color: ${mainColor}; margin: 0 0 12px 0; font-size: 20px; font-weight: 700;">Finish setting up your account</h2>
            <p style="color: ${mutedColor}; font-size: 14px; margin: 0 0 14px 0;">Hi <strong>${options.name || "there"}</strong>,</p>
            <p style="color: ${mutedColor}; font-size: 14px; margin: 0 0 22px 0;">Click the button below to confirm your email and get instant access to your courses and learning dashboard.</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${options.activationUrl}"
                style="background: ${accentColor}; box-shadow: 0 6px 18px rgba(124,58,237,0.18); color: #fff; padding: 14px 30px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block;">
                Confirm Email & Access Dashboard
              </a>
            </div>
            <p style="color: ${mutedColor}; font-size: 13px; margin: 6px 0 0 0;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; font-size: 12px; color: #9f92e6;">${options.activationUrl}</p>
          </div>
          <div style="background: #fbf7ff; padding: 20px 28px; text-align: center; border-top: 1px solid ${borderColor};">
            <p style="color: #8b84b8; font-size: 13px; margin: 0 0 6px 0;">&copy; ${new Date().getFullYear()} LearnX. All rights reserved.</p>
            <p style="color: #bfb7e6; font-size: 12px; margin: 0;">This is an automated message — please do not reply.</p>
          </div>
        </div>
      </div>
    `;
    }
    // Question Reply Email
    else if (emailType === "question-reply" && options.data) {
        const { name, title, answer, questionText, instructorName } = options.data;
        html = `
      <div style="background: #fbf7ff; padding: 36px 0; font-family: ${fontFamily};">
        <div style="max-width: 680px; margin: auto; background: ${cardBg}; border-radius: ${borderRadius}; box-shadow: ${cardShadow}; border: 1px solid ${borderColor}; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.02) 100%); padding: 24px 20px; text-align: center; border-bottom: 1px solid rgba(124,58,237,0.03);">
            <h1 style="color: ${mainColor}; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.3px;">LearnX</h1>
            <p style="color: ${mutedColor}; margin: 6px 0 0 0; font-size: 12px;">Course Q&A • Notification</p>
          </div>
          <div style="padding: 28px 34px;">
            <h2 style="color: ${mainColor}; margin: 0 0 8px 0; font-size: 18px; font-weight: 700;">A reply to your question is ready</h2>
            <p style="color: ${mutedColor}; font-size: 14px; margin: 6px 0 18px 0;">Hello <strong style="color: ${mainColor};">${name}</strong>,</p>
            <p style="color: ${mutedColor}; font-size: 14px; margin: 0 0 18px 0;">An instructor has responded to your question in <strong>${title}</strong>. Below is a short preview — tap through to see the full context and continue the discussion.</p>

            <div style="background: #fff; border: 1px solid rgba(124,58,237,0.06); border-radius: 10px; padding: 16px; margin: 18px 0;">
              <div style="font-size: 13px; color: ${mutedColor}; margin-bottom: 8px; font-weight: 600;">Your question</div>
              <div style="color: #374151; font-size: 14px; font-style: italic;">${questionText || "Your question about the course content"}</div>
            </div>

            <div style="background: linear-gradient(180deg, rgba(124,58,237,0.06), rgba(124,58,237,0.02)); border-radius: 10px; padding: 16px; margin: 12px 0; border: 1px solid rgba(124,58,237,0.08);">
              <div style="font-size: 13px; color: ${mainColor}; margin-bottom: 8px; font-weight: 700;">Answer from ${instructorName || "the instructor"}</div>
              <div style="color: #111827; font-size: 14px; line-height: 1.6;">${answer || "Please view the full answer in your course dashboard."}</div>
            </div>

            <div style="text-align: center; margin: 18px 0;">
              <a href="${process.env.FRONTEND_URL}/course/${options.data.courseId}"
                style="background: ${accentColor}; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block; box-shadow: 0 8px 24px rgba(124,58,237,0.14);">View full discussion</a>
            </div>

            <p style="color: ${mutedColor}; font-size: 13px; margin: 12px 0 0 0;">Keep the momentum — engage with your instructor and peers to deepen your understanding.</p>
            <p style="color: ${mutedColor}; font-size: 13px; margin: 14px 0 0 0;">Need assistance? Reach out to <a href="mailto:support@learnx.com" style="color: ${accentColor}; font-weight: 600; text-decoration: none;">support@learnx.com</a>.</p>
          </div>
          <div style="background: #fbf7ff; padding: 16px 24px; text-align: center; border-top: 1px solid ${borderColor};">
            <p style="color: #8b84b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} LearnX. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
    }
    // Order Confirmation Email
    else if (emailType === "order-confirmation" && options.data) {
        const { userName, courseName, orderNumber, amount, date } = options.data;
        html = `
      <div style="background: #fbf7ff; padding: 36px 0; font-family: ${fontFamily};">
        <div style="max-width: 700px; margin: auto; background: ${cardBg}; border-radius: ${borderRadius}; box-shadow: ${cardShadow}; border: 1px solid ${borderColor}; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #057a55 0%, ${accentColor} 100%); padding: 22px 20px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 20px; font-weight: 800;">Order confirmed — you're all set</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 12px;">Thank you for choosing LearnX</p>
          </div>
          <div style="padding: 28px 32px;">
            <p style="color: ${mutedColor}; font-size: 14px; margin: 0 0 8px 0;">Hi <strong style="color: ${mainColor};">${userName}</strong>,</p>
            <p style="color: ${mutedColor}; font-size: 14px; margin: 0 0 18px 0;">We’ve successfully processed your order. Your course is ready — you can access it from your dashboard right away.</p>

            <div style="background: #fff; border: 1px solid rgba(124,58,237,0.06); border-radius: 10px; padding: 18px; margin: 16px 0;">
              <div style="font-size: 13px; color: ${mutedColor}; margin-bottom: 8px; font-weight: 600;">Order summary</div>
              <div style="display:flex; flex-wrap:wrap; gap:12px; font-size: 14px; color: #111827;">
                <div style="flex:1; min-width:180px;"><strong>Order #</strong> <span style="color:${mainColor}; font-weight:700;">#${orderNumber}</span></div>
                <div style="flex:1; min-width:180px;"><strong>Course</strong> <div style="color:${mainColor}; font-weight:700;">${courseName}</div></div>
                <div style="flex:1; min-width:120px;"><strong>Amount</strong> <div style="color:${successColor}; font-weight:800;">$${amount}</div></div>
                <div style="flex:1; min-width:140px;"><strong>Date</strong> <div style="color:${mainColor}; font-weight:600;">${date}</div></div>
              </div>
            </div>

            <div style="text-align:center; margin: 16px 0;">
              <a href="${process.env.FRONTEND_URL}/course/${options.data.courseId}"
                style="background: ${accentColor}; color: #fff; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block; box-shadow: 0 10px 26px rgba(124,58,237,0.12);">Access your course</a>
            </div>

            <p style="color: ${mutedColor}; font-size: 13px; margin: 8px 0 0 0;">If you have any questions about your purchase, reply to this email or contact <a href="mailto:support@learnx.com" style="color: ${accentColor}; text-decoration: none; font-weight: 600;">support@learnx.com</a>.</p>
          </div>
          <div style="background: #fbf7ff; padding: 16px 24px; text-align:center; border-top: 1px solid ${borderColor};">
            <p style="color: #8b84b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} LearnX. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
    }
    else {
        html = `
      <div style="background: #fbf7ff; padding: 40px 0; font-family: ${fontFamily};">
        <div style="max-width: 680px; margin: auto; background: ${cardBg}; border-radius: 12px; box-shadow: 0 6px 18px rgba(43,15,111,0.06); overflow: hidden; border: 1px solid ${borderColor};">
          <div style="background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.02) 100%); padding: 20px 20px; text-align: center; border-bottom: 1px solid rgba(124,58,237,0.03);">
            <h1 style="color: ${mainColor}; margin: 0; font-size: 20px; font-weight: 800;">LearnX</h1>
            <p style="color: ${mutedColor}; font-size: 12px; margin: 6px 0 0 0;">Modern learning — professional growth</p>
          </div>
          <div style="padding: 32px 30px;">
            <p style="color: ${mutedColor}; font-size: 15px; line-height: 1.6;">${options.message || "A message from LearnX"}</p>
          </div>
          <div style="background: #fbf7ff; padding: 18px 24px; text-align: center; border-top: 1px solid ${borderColor};">
            <p style="color: #8b84b8; font-size: 13px; margin: 0;">&copy; ${new Date().getFullYear()} LearnX. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
    }
    // Generate appropriate text content based on email type
    let textContent = "";
    if (emailType === "activation" && activationCode) {
        textContent = `Hello ${options.name || "there"},\n\nThank you for registering with LearnX. Your verification code is: ${activationCode}\n\nThis code expires in 5 minutes. If you did not request this, please contact support@learnx.com immediately.\n\nWarm regards,\nThe LearnX Team`;
    }
    else if (emailType === "question-reply" && options.data) {
        textContent = `Hello ${options.data.name},\n\nAn instructor has replied to your question in "${options.data.title}".\n\nQuestion: ${options.data.questionText || "(your question)"}\nAnswer: ${options.data.answer || "(please check your course dashboard for the full reply)"}\n\nTo view the full discussion and continue the conversation, visit: ${process.env.FRONTEND_URL}/course/${options.data.courseId}\n\nSincerely,\nThe LearnX Team`;
    }
    else if (emailType === "order-confirmation" && options.data) {
        textContent = `Hello ${options.data.userName},\n\nWe’ve received and confirmed your order. Your course "${options.data.courseName}" is now available in your LearnX dashboard.\n\nOrder summary:\nOrder #: #${options.data.orderNumber}\nCourse: ${options.data.courseName}\nAmount: $${options.data.amount}\nDate: ${options.data.date}\n\nAccess your course here: ${process.env.FRONTEND_URL}/course/${options.data.courseId}\n\nThank you for choosing LearnX.\n\nBest regards,\nThe LearnX Team`;
    }
    else {
        textContent = options.message || "Thank you for using LearnX — we’re here to help you grow.";
    }
    const mailOptions = {
        from: `"LearnX" <${process.env.SMTP_MAIL}>`,
        to: options.email,
        subject: options.subject,
        text: textContent,
        html,
    };
    await transporter.sendMail(mailOptions);
};
exports.default = sendMail;
//# sourceMappingURL=sendMail.js.map