# Fruvida - Fresh Food Delivery App

Fruvida is a modern web application for ordering fresh fruits, vegetables, and other healthy food products online. The platform focuses on delivering high-quality, fresh products directly to customers' doors with an intuitive user interface and seamless shopping experience.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Admin Access](#admin-access)
- [Features](#features)
  - [Authentication](#authentication)
  - [Home Page](#home-page)
  - [Products Page](#products-page)
  - [Product Details](#product-details)
  - [Cart](#cart)
  - [Checkout](#checkout)
  - [User Account](#user-account)
  - [Admin Dashboard](#admin-dashboard)
  - [Contact](#contact)
  - [About](#about)
- [Technologies Used](#technologies-used)

## Overview

Fruvida is designed to connect consumers with fresh, locally-sourced produce. This frontend-focused project showcases a modern React application that allows users to browse products, read reviews, place orders, and track their deliveries. It also features a comprehensive admin panel for managing products, orders, and user accounts.

## Getting Started

### Prerequisites

- Node.js (v14.0 or newer)
- npm (v6.0 or newer)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/georgi712/regular-exam-project.git
   cd regular-exam-project
   ```

2. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

### Running Locally

1. Start the server :
   ```bash
   cd server
   node server
   ```

2. Start the client application (in a separate terminal):
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173` (or the port displayed in your terminal)

## Admin Access

The application comes with a preconfigured admin account:
- **Email**: admin@abv.bg
- **Password**: admin

The admin user has exclusive access to:
- Admin dashboard
- Creating and updating products
- Managing order statuses
- Viewing site metrics and statistics

## Features

### Authentication
- Separate Login and Register pages
- Password validation with minimum length requirement
- Toast notifications for authentication errors and success messages

### Home Page
- Hero section 
- Address check functionality to verify delivery area
- Featured products carousel with newest arrivals
- Featured categories section for easy product browsing
- "Why Choose Us" section highlighting business values

### Products Page
- Product grid with filtering options
- Search functionality
- Product sorting by price, popularity, etc.
- Category filtering
- Pagination

### Product Details
- Comprehensive product information
- Quantity selector
- Add to cart functionality
- Comments section with reviews
  - Users can create, read, update, and delete their own comments
  - Star rating system
  - Date display for comments

### Cart
- Product list with images and details
- Quantity adjustment
- Price calculation
- Remove items
- Proceed to checkout

### Checkout
- Multi-step delivery process
- Address selection/input
- Auto-fill user information from profile
- Two payment method options
- Order summary
- Order confirmation page upon completion

### User Account
- Registration and login
- Profile management
- Address book
  - Add new addresses
  - Delete existing addresses
  - Set default address
- Order history with detailed view
- Order tracking

### Admin Dashboard
- Key metrics overview (orders, revenue, products)
- Products management
  - Add, edit, and delete products
  - Advanced search options
  - Upload product images (stored in Firebase)
- Orders management
  - View all orders
  - Update order status
  - Filter and search orders

### Contact
- Contact form
- Store location with integrated Google Maps
- Contact information (phone, email, address)

### About
- Company information
- Mission statement
- Team members
- Focus of the business

## Technologies Used

### Frontend
- React.js
- Vite
- Tailwind CSS
- DaisyUI
- React Router
- Context API for state management
- React Toastify for notifications
- Vitest for testing
- Google Maps API for location features
- Firebase Storage for product images


