# LeetCode Clone

A full-stack coding practice platform inspired by LeetCode. Users can browse problems, write code in an in-browser editor, run it against test cases, and track their submissions.

> **Live demo:** [add link after deployment]

---

## Features

- **User authentication**: register, log in, and log out with JWT-based sessions and protected routes
- **Problem library**: browse coding problems with difficulty levels (Easy, Medium, Hard) and tags
- **Search and filters**: find problems by title, difficulty, or topic
- **Code editor**: write solutions in the browser with syntax highlighting
- **Run and submit code**: execute code against sample and hidden test cases and get a verdict (Accepted, Wrong Answer, Runtime Error, Time Limit Exceeded)
- **Submission history**: review your past submissions for each problem
- **User profile**: track solved problems and progress
- **Admin tools** _(optional)_: add and edit problems and test cases

> Edit this list so it only contains features your project actually has.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | [React / Next.js], [Tailwind CSS / SCSS], [Monaco Editor / CodeMirror] |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Authentication | JWT, [cookies / localStorage] |
| Code execution | [Judge0 API / Piston API / Docker sandbox / custom runner] |
| Deployment | [Vercel / Render / Railway] |

## Project Structure

```
[project-name]/
├── Backend/
│   ├── server.js
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/        # User, Problem, Submission
│       ├── routes/
│       └── services/      # code execution
└── Frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        └── context/
```

> Adjust this to match your real folders.

## Getting Started

### Prerequisites


- [Node.js](https://nodejs.org/) (LTS version)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account or a local MongoDB
- [Code execution API key, if you use Judge0 or similar]

### 1. Clone the repository

```bash

git clone https://github.com/nikhilrautan/[repo-name].git
cd [repo-name]
```

### 2. Backend

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend`:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
# Add your code execution API key / URL here
```

Start the server:

```bash
npm run dev
```

### 3. Frontend

In a second terminal:

```bash
cd Frontend
npm install
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`).

## How It Works

1. A user signs up and logs in. The server issues a JWT that protects private routes.
2. The user opens a problem and writes a solution in the code editor.
3. On **Run** or **Submit**, the code is sent to the backend with the chosen language.
4. The backend runs the code against the problem's test cases using the execution service.
5. The result (verdict, runtime, output) is saved as a submission and shown to the user.

## Screenshots

_Add screenshots of the problem list, the editor page, and a submission result._

## Roadmap

- [ ] Multiple language support
- [ ] Discussion and solution sections
- [ ] Contests and leaderboard
- [ ] Daily challenge
- [ ] Bookmarks and problem lists

## Author

**Nikhil Rautan**: [GitHub](https://github.com/nikhilrautan)
