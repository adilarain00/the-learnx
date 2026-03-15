# LearnX | Production-Grade LMS Platform

**LearnX** is a modern, full-featured **Learning Management System (LMS)** built with a powerful **TypeScript-first MERN architecture (Next.js + Node/Express).**
Designed for secure, scalable online education, LearnX enables instructors to sell premium courses while ensuring protected video delivery, seamless payments, real-time analytics, and structured course management.

From DRM-protected streaming to Stripe-powered transactions and live platform insights — LearnX blends **security, performance, and product-driven architecture** into one scalable ecosystem.

![LearnX Screenshot](./client/public/assets/thumb1.png)

<br />

<p align="center">
  <a href="https://the-learnx.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🌍 Live_Project-000000?style=for-the-badge&logo=&logoColor=white" />
  </a>

  <a href="https://www.youtube.com/watch?v=YOUR_VIDEO_LINK" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white" />
  </a>

  <a href="https://github.com/adilarain00/the-learnx" target="_blank">
    <img src="https://img.shields.io/badge/GitHub_Repo-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>

  <a href="https://aadil-amjad.me/project/the-learnx" target="_blank">
    <img src="https://img.shields.io/badge/📝 Case_Study-4CAF50?style=for-the-badge&logo=&logoColor=white" />
  </a>

  <!-- ✍️ Blog (Portfolio) -->
  <a href="https://aadil-amjad.me/blog/the-learnx" target="_blank">
    <img src="https://img.shields.io/badge/Blog-FF9800?style=for-the-badge&logo=googlescholar&logoColor=white" />
  </a>

  <!-- 🔗 LinkedIn Post -->
  <a href="https://www.linkedin.com/posts/adilarain00_mern-fullstackdevelopment-ecommerce-activity-7378328560085819392-y1ci?utm_source=share&utm_medium=member_desktop&rcm=ACoAAE9gbZABjWJQao04XHSlnY-6-rfc8s4LNrc" target="_blank">
    <img src="https://img.shields.io/badge/🔗 LinkedIn_Post-0A66C2?style=for-the-badge&logo=&logoColor=white" />
  </a>
</p>

---

## Tech Stack

- **🎨 Frontend:** Next.js 13+, React 18, TypeScript, Redux Toolkit + RTK Query, Tailwind CSS, Material UI
- **⚙️ Backend:** Node.js, Express.js, TypeScript
- **🗄 Database & Caching:** MongoDB, Mongoose, Redis
- **🔐 Authentication & Security:** JWT, bcryptjs, NextAuth
- **💳 Payments:** Stripe
- **📺 Secure Video Delivery:** VdoCipher (DRM + Watermark Protection)
- **📧 Email System:** Nodemailer
- **⚡ Real-time Features:** Socket.io
- **☁️ Media Storage:** Cloudinary
- **🚀 Deployment:** Vercel (Frontend), Render (Backend)

---

## Features

### 👤 User Features

- 🔐 Secure authentication & role-based authorization
- 🎓 Enroll in premium courses with instant activation
- 📺 DRM-protected video streaming
- 📂 Downloadable resources & structured curriculum
- 📊 Progress tracking & learning analytics dashboard
- 🧾 Enrollment history & purchase tracking
- 📱 Fully responsive & accessible interface

### 🧑‍🏫 Instructor & Course Features

- 🏗 Full course creation module (curriculum builder, lessons, quizzes)
- 🎥 Secure video uploads with watermark & anti-piracy protection
- 💰 Flexible pricing, discounts & monetization tools
- 📈 Sales analytics & revenue tracking
- 📝 Assessments, quizzes & performance insights
- 🎓 Certificate generation system

### ⚙️ Admin Features

- 📊 Centralized admin dashboard
- 👥 Manage users, instructors & permissions
- 📝 Course approval & moderation workflow
- 💳 Payment monitoring & refund management
- 🚨 Blocked user & suspicious activity handling
- 🔧 Global configuration & role control

### ⚡ Real-Time Platform Capabilities

- 🔔 Real-time notifications (enrollments, payments, updates)
- 📈 Live revenue & engagement analytics
- 📧 Automated transactional email system
- 🔄 Role-based live dashboard updates
- 🛠 Structured error monitoring & logging

---

## File & Folder Structure

```plaintext
client/
├── public/                     # Static assets (images, favicon, thumbnails)
├── redux/                      # Redux Toolkit store, slices & RTK Query APIs
├── app/                        # Next.js App Router structure
│ ├── about/                    # About page
│ ├── admin/                    # Admin dashboard & management pages
│ ├── api/                      # Next.js API routes (if any)
│ ├── components/               # Reusable UI components
│ ├── course/                   # Single course details & learning pages
│ ├── course-access/            # Protected course access pages
│ ├── courses/                  # Course listing & discovery pages
│ ├── faq/                      # FAQ page
│ ├── hooks/                    # Custom React hooks
│ ├── privacy/                  # Privacy policy page
│ ├── profile/                  # User profile & dashboard
│ ├── providers/                # Context providers (Auth, Theme, etc.)
│ ├── static/                   # Static constants & configuration data
│ ├── styles/                   # Global & modular styling files
│ ├── global.css                # Global CSS styles
│ ├── layout.tsx                # Root layout component
│ └── page.tsx                  # Landing / Home page

server/
├── controllers/                # Business logic for routes
├── db/                         # Database connection configuration
├── dist/                       # Compiled TypeScript build output
├── middleware/                 # Auth, role-based & error middleware
├── models/                     # Mongoose schemas & database models
├── routes/                     # Express route definitions
├── services/                   # External integrations (Stripe, VdoCipher, Email)
├── utils/                      # Helper functions & utilities
├── @types/                     # Custom TypeScript type definitions
├── .env                        # Environment variables
├── index.ts                    # Express server entry point
└── socketServer.ts             # Socket.io real-time server setup

```

---

## Conclusion

**LearnX** is more than just an LMS — it’s a secure digital learning infrastructure built with scalability and monetization in mind.

From protected content delivery to real-time revenue analytics, every module reflects a **production-focused engineering approach**.

This project demonstrates:

- Full-stack TypeScript architecture
- Secure payment & DRM integrations
- Role-based system design
- Real-time data flow
- SaaS-level platform thinking

---

## Contact

<p align="center">
  <a href="https://aadil-amjad.me" target="_blank">
    <img src="https://img.shields.io/badge/Portfolio-black?style=for-the-badge&logo=firefox&logoColor=white" />
  </a>
  <a href="https://www.linkedin.com/in/adilarain00" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" />
  </a>
  <a href="https://github.com/adilarain00" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="mailto:addilarain00@gmail.com">
    <img src="https://img.shields.io/badge/Email-d14836?style=for-the-badge&logo=gmail&logoColor=white" />
  </a>
</p>
