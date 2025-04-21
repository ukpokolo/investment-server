# Investment API

This is a backend API for managing investments, wallets, transactions, and user accounts. It is built using Node.js, Express, and MongoDB.

## Features

- User authentication and authorization (JWT-based)
- Admin and user roles
- Investment plans management
- Wallet creation and management
- Transactions (investments, withdrawals)
- Notifications system
- Password reset functionality
- Admin dashboard for managing users, investments, and transactions

## Technologies Used

- Node.js
- Express.js
- MongoDB (Mongoose)
- JSON Web Tokens (JWT)
- Nodemailer (for email notifications)
- dotenv (for environment variable management)

## Prerequisites

- Node.js (>= 14.0.0)
- MongoDB
- A `.env` file with the following variables:
  ```
  PORT=5000
  MONGODB_URI=<your-mongodb-uri>
  JWT_SECRET=<your-jwt-secret>
  EMAIL_USER=<your-email-address>
  EMAIL_PASS=<your-email-password>
  FRONTEND_URL=<your-frontend-url>
  ```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ukpokolo/investment-server.git
   cd investment-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the required environment variables.

4. Start the server:
   - Development:
     ```bash
     npm run dev
     ```
   - Production:
     ```bash
     npm run start:prod
     ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user/admin
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-reset-code` - Verify password reset code
- `POST /api/auth/reset-password` - Reset password

### Users

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Edit user profile
- `PUT /api/users/password` - Change user password

### Wallets

- `POST /api/wallets` - Create a new wallet
- `GET /api/wallets` - Get user wallets
- `GET /api/wallets/:walletId` - Get wallet details
- `PUT /api/wallets/:walletId` - Update wallet
- `DELETE /api/wallets/:walletId` - Delete wallet

### Transactions

- `POST /api/transactions/invest` - Create an investment
- `POST /api/transactions/withdraw` - Request a withdrawal
- `GET /api/transactions` - Get user transactions
- `GET /api/transactions/all` - Get all transactions (admin only)

### Investments

- `GET /api/investments` - Get all investment plans
- `POST /api/investments` - Create a new investment plan (admin only)
- `PUT /api/investments/:id` - Update an investment plan (admin only)
- `DELETE /api/investments/:id` - Delete an investment plan (admin only)

### Admin

- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete a user
- `GET /api/admin/investments` - Get all investments
- `GET /api/admin/notifications` - Get admin notifications
- `POST /api/admin/notifications/mark-as-read` - Mark notifications as read


## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## Contact

For any inquiries, please contact jiukpokolo@gmail.com.
