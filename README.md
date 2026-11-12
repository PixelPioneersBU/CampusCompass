# CampusCompass 🎓
<p align="center">
  <img src="https://i.pinimg.com/736x/d9/83/70/d983707124eff1a4e4e4f22a847b2685.jpg" alt="Pixel Pioneers Banner" width="10%">
</p>
**Your university life, organized in one place.**

CampusCompass is a student companion platform designed to help university students manage campus activities, academic deadlines, study schedules, and learning resources through a single dashboard.

<p align="center">
  <a href="https://campus-compass-alpha-teal.vercel.app/"><strong>🌐 Live Website</strong></a> ·
  <a href="https://github.com/PixelPioneersBU/CampusCompass"><strong>💻 GitHub Repository</strong></a>
</p>

---

## ✨ Features

- **Student Dashboard:** Overview of upcoming events, deadlines, and study sessions.
- **Events Explorer:** Discover university and student-created events.
- **Deadline Tracker:** Add, manage, and track academic deadlines.
- **Study Planner:** Organize study sessions and monitor progress.
- **Resource Hub:** Explore and bookmark useful learning resources.
- **Authentication:** Student signup, login, email verification, and password recovery.
- **Profile Management:** Update your student profile.
- **Data Privacy:** Individual student data protected using Supabase Row Level Security.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling and responsive design |
| JavaScript | Frontend functionality |
| Supabase | Authentication and PostgreSQL database |
| Git & GitHub | Version control |
| Vercel | Deployment and hosting |

## 📁 Project Structure

```text
CampusCompass/
│
├── index.html
├── auth.html
├── events.html
├── deadlines.html
├── study.html
├── resources.html
├── reset-password.html
│
├── style.css
├── script.js
├── auth.js
├── auth-guard.js
├── profile.js
├── supabase.js
├── events.js
├── deadlines.js
├── study.js
├── resources.js
├── reset-password.js
│
├── logo.jpg
├── .gitignore
└── README.md
```

## 🚀 Run Locally

1. Clone the repository:

```bash
git clone https://github.com/PixelPioneersBU/CampusCompass.git
```

2. Open the project folder:

```bash
cd CampusCompass
```

3. Open the folder in VS Code.

4. Start the project using the **Live Server** extension.

5. Open the local URL provided by Live Server.

## ⚙️ Supabase Configuration

CampusCompass uses Supabase for authentication and database operations.

To configure your own instance:

1. Create a project on [Supabase](https://supabase.com/).
2. Set up the required database tables and Row Level Security policies.
3. Configure authentication and redirect URLs.
4. Add your Supabase project URL and publishable key in `supabase.js`.

**Security:** Never expose your Supabase service-role key, secret keys, or database password in frontend code.

## 🌐 Deployment

CampusCompass is deployed using Vercel.

**Live URL:**  
https://campus-compass-alpha-teal.vercel.app/

Every push to the connected GitHub `main` branch triggers an automatic deployment.

## 👥 Team

**Pixel Pioneers**

GitHub Organization: [@PixelPioneersBU](https://github.com/PixelPioneersBU)

*Think. Code. Create. Repeat.*

## 📄 License

This project was developed as a university Web Development mini-project.
