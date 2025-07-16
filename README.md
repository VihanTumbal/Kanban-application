# TaskFlow - Modern Kanban Application

A full-stack Kanban board application built with the MERN stack, featuring drag-and-drop functionality, user authentication, and real-time collaboration.

## 🚀 Features

- **User Authentication:** JWT-based registration and login
- **Board Management:** Create, view, and manage Kanban boards
- **List Management:** Organize tasks in customizable lists
- **Card Management:** Create, edit, and move cards between lists
- **Drag & Drop:** Intuitive drag-and-drop interface (planned)
- **File Attachments:** Upload and manage task attachments (planned)
- **Responsive Design:** Mobile-friendly interface with TailwindCSS

## 🛠️ Tech Stack

### Frontend

- **React** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React DnD** - Drag and drop functionality (planned)

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
Kanban Application/
├── kanban-client/          # Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── kanban-server/          # Backend (Node.js + Express)
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   ├── package.json
│   └── index.js
├── .gitignore
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Backend Setup

1. Navigate to the server directory:

   ```bash
   cd kanban-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:

   ```bash
   cd kanban-client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The client will run on `http://localhost:5173`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Boards

- `GET /api/boards` - Get all user boards
- `POST /api/boards` - Create a new board
- `GET /api/boards/:id` - Get board by ID
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Lists

- `GET /api/lists/board/:boardId` - Get lists for a board
- `POST /api/lists` - Create a new list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list

### Cards

- `GET /api/cards/list/:listId` - Get cards for a list
- `POST /api/cards` - Create a new card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

## 🧪 Testing

Run the API tests:

```bash
cd kanban-server
node test-api.js
```

## 🚀 Deployment

### Backend Deployment

- Deploy to platforms like Heroku, Railway, or DigitalOcean
- Ensure environment variables are set in production

### Frontend Deployment

- Build the production version: `npm run build`
- Deploy to platforms like Vercel, Netlify, or GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Vihan Tumbal**

- GitHub: [@VihanTumbal](https://github.com/VihanTumbal)

## Features

- User authentication (JWT)
- Boards, lists, and cards management
- Drag-and-drop (React DnD)
- File uploads (Multer)
- Responsive UI (TailwindCSS)

---

Continue following the step-by-step plan to implement features and APIs.
