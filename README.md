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

  - <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="24" valign="middle" /> React
  - <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg" width="24" valign="middle" /> Redux Toolkit
  - <img src="https://reactrouter.com/favicon-light.png" width="24" valign="middle" /> React Router
  - <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" width="24" valign="middle" /> Tailwind CSS
  - <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="24" valign="middle" /> Vite
  - <img src="https://axios-http.com/assets/logo.svg" width="24" valign="middle" /> Axios
  - <img src="https://react-hook-form.com/images/logo/react-hook-form-logo-only.png" width="24" valign="middle" /> React Hook Form

- **Backend**
  - <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="24" valign="middle" /> Node.js
  - <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" width="24" valign="middle" /> Express.js
  - <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" width="24" valign="middle" /> MongoDB
  - 🦆 Mongoose
  - <img src="https://www.passportjs.org/images/logo.svg" width="24" valign="middle" /> Passport.js (Google OAuth)
  - <img src="https://jwt.io/img/pic_logo.svg" width="24" valign="middle" /> JSON Web Tokens (JWT)
  - 🔒 Bcrypt
  - <img src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fbrandfetch.com%2Fstripe.com&psig=AOvVaw2dDF8ykezxeNrezDsyYGCL&ust=1752881445705000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCPjxlrGGxY4DFQAAAAAdAAAAABAE" width="24" valign="middle" /> Stripe API
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
