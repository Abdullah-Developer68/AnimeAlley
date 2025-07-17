# Anime Alley

Anime Alley is a full-stack MERN e-commerce application designed for anime enthusiasts. It provides a seamless shopping experience for merchandise like clothes, action figures, and comics, and includes a powerful admin dashboard for complete business management.

## Features

The application is divided into two main parts: the customer-facing storefront and a feature-rich admin dashboard.

### 🛍️ Customer-Facing Features

- **Robust Authentication**: Secure user authentication system with multiple options:
  - **Local Authentication**: Standard email and password signup, enhanced with a one-time password (OTP) verification step sent to the user's email.
  - **Google OAuth 2.0**: Allows users to sign up and log in instantly with their Google account.
- **Dynamic Shopping Experience**:
  - **Product Discovery**: Browse a wide range of products, view detailed descriptions, and filter by category.
  - **Powerful Search**: Easily find specific items using the search functionality.
- **Advanced Shopping Cart**:
  - A persistent cart that reserves items for a user during their session.
  - Users can add/remove items and update quantities.
- **Coupon System**: Users can apply valid coupon codes at checkout to receive percentage-based discounts on their orders.
- **Dual Payment Methods**:
  - **Cash on Delivery (COD)**: For users who prefer to pay upon receiving their order.
  - **Stripe Integration**: Secure online payments via credit/debit card, processed by Stripe.
- **Order History**: Registered users have a dedicated section to view their complete purchase history, including order status, shipping details, and a summary of all items purchased.
- **Responsive UI**: A modern, responsive design built with Tailwind CSS that provides an excellent user experience on both desktop and mobile devices.

### ⚙️ Admin Dashboard Features

A secure, role-based dashboard for administrators to manage the entire e-commerce platform.

- **User Management**: Admins can view a list of all registered users, search for specific users, and manage their accounts.
- **Product Management**: Full CRUD (Create, Read, Update, Delete) functionality for all products in the store.
- **Coupon Management**:
  - Create new coupons with specific discount percentages and expiry dates.
  - View all active and expired coupons.
  - Track coupon performance with statistics on total usage and lifetime discount value.
- **Order Management**: View a comprehensive list of all orders placed on the platform and update their status (e.g., Processing, Shipped, Delivered).
- **Data Export**: A powerful export feature that allows admins to download crucial business data for reporting and analysis. Data for **Users, Products, Orders, and Coupons** can be exported in both **Excel (.xlsx)** and **PDF (.pdf)** formats.

## Tech Stack

This project leverages a modern MERN stack and other industry-standard technologies.

- **Frontend**:

  - **React**: A JavaScript library for building user interfaces.
  - **Redux Toolkit**: For predictable and centralized state management.
  - **React Router**: For client-side routing and navigation.
  - **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
  - **Vite**: A next-generation frontend build tool.
  - **Axios**: For making HTTP requests to the backend API.
  - **React Hook Form**: For efficient and performant form handling.

- **Backend**:
  - **Node.js**: A JavaScript runtime for the server.
  - **Express.js**: A web application framework for Node.js.
  - **MongoDB**: A NoSQL database for storing application data.
  - **Mongoose**: An ODM (Object Data Modeling) library for MongoDB and Node.js.
  - **Passport.js**: Authentication middleware for Node.js, used here for the Google OAuth strategy.
  - **JSON Web Tokens (JWT)**: For securing the local authentication flow.
  - **Bcrypt**: For hashing user passwords before storing them.
  - **Stripe API**: For processing online payments securely.
  - **Multer**: Middleware for handling `multipart/form-data`, used for file uploads (e.g., product images).
  - **Node-Cron**: A task scheduler used for automated cleanup of unverified user accounts.

## Architecture

The application is built on the **MERN (MongoDB, Express.js, React, Node.js)** stack, ensuring a consistent JavaScript environment across both client and server.

The backend follows a structured, **MVC (Model-View-Controller)** like pattern to promote separation of concerns and maintainability:

- **`models/`**: Defines the Mongoose schemas for all database collections (Users, Products, Orders, Coupons, etc.).
- **`controllers/`**: Contains the logic to handle incoming API requests, interact with services, and send back responses.
- **`services/`**: Encapsulates the core business logic. For example, `auth.js` handles user authentication, `stripe.js` manages payment session creation, and `export.service.js` contains the logic for generating PDF and Excel files.
- **`routes/`**: Defines the API endpoints and maps them to the appropriate controller functions.
- **`middlewares/`**: Holds middleware functions for tasks like CORS handling, request logging, and session management.

The frontend is a **Single Page Application (SPA)** built with React, featuring a component-based architecture. Global state is managed efficiently with Redux, and all API interactions are centralized in a dedicated `api.js` service file.
