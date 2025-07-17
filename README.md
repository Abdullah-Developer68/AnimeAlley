# Anime Alley ⛩️

A full-stack MERN e-commerce app for anime fans. 🛍️ Features a storefront for customers and a powerful admin dashboard for business management.

## Features

### 🛍️ For Customers

- 🔐 **Secure Auth**: Sign up with Email/Password (OTP verified) or Google.
- 🛍️ **Dynamic Shopping**: Browse products, filter by category, and search with ease.
- 🛒 **Advanced Cart**: A persistent cart that reserves your items during your session.
- 🎟️ **Coupon System**: Apply valid coupon codes at checkout for discounts.
- 💳 **Dual Payments**: Choose between Cash on Delivery (COD) or secure online payment with Stripe.
- 📜 **Order History**: View your complete purchase history and track order status.
- 📱 **Responsive UI**: A clean, modern design that works perfectly on desktop and mobile.

### ⚙️ For Admins

A secure, role-based dashboard to manage the entire platform.

- 👨‍👩‍👧‍👦 **User Management**: View, search, and manage all registered users.
- 📦 **Product Management**: Full CRUD (Create, Read, Update, Delete) for all products.
- 🎟️ **Coupon Management**: Create new coupons, view stats, and track performance.
- 🚚 **Order Management**: View all orders and update their status (e.g., Processing, Shipped).
- 📊 **Data Export**: Export Users, Products, Orders, and Coupons to **Excel (.xlsx)** & **PDF (.pdf)**.

## Tech Stack 🛠️

- **Frontend** 🚀

  - ⚛️ React
  - 📦 Redux Toolkit
  - 🧭 React Router
  - 💨 Tailwind CSS
  - ⚡ Vite
  - 🌐 Axios
  - 📝 React Hook Form

- **Backend** サーバー
  - 🟢 Node.js
  - 🚂 Express.js
  - 🍃 MongoDB
  - 🦆 Mongoose
  - 🛂 Passport.js (Google OAuth)
  - 🔑 JSON Web Tokens (JWT)
  - 🔒 Bcrypt
  - 💳 Stripe API
  - 📤 Multer
  - 🕒 Node-Cron

## Architecture 🏗️

Built on the **MERN** stack for a unified JavaScript environment.

- **Backend Structure**: Follows an MVC-like pattern for clean code.

  - `models/`: Mongoose schemas.
  - `controllers/`: Handles API requests.
  - `services/`: Core business logic.
  - `routes/`: API endpoints.
  - `middlewares/`: CORS, sessions, etc.

- **Frontend Structure**: A **Single Page Application (SPA)** with a component-based architecture and global state managed by Redux.
