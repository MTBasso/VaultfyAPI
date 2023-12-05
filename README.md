# Vaultfy API

Vaultfy API is a powerful and secure password manager designed to simplify the management of login credentials while prioritizing user privacy and data security. Built with Express and MongoDB, this API provides a reliable backend solution for securely storing and managing passwords.

## Features

- **User Registration**: Easily create user accounts to get started.
- **Authentication**: Secure user authentication for access control.
- **Credential Management**: Add, update, and delete your login credentials.
- **Express Framework**: Built on Express for a fast and scalable backend.
- **MongoDB Storage**: Utilizes MongoDB for flexible and scalable data storage.

## Getting Started

Follow these steps to set up and run SecurePass API:

1. **Clone the Repository:**
   ```
   git clone https://github.com/MTBasso/VaultfyAPI.git
   ```

2. **Install Dependencies:**
   ```
   npm install
   ```

3. **Configure Environment Variables:**
Create a .env file in the root directory and add your MongoDB connection string and other configuration details.

4. Run the Application:
```
npm start
```
Visit http://localhost:3001 to access the API.

## API Endpoints
Auth Routes
  - POST /register
  - POST /login
  - PUT /change-password

Credential Routes:
  - POST /create-credential
  - GET /fetch-credential
  - PUT /update-credential
  - DELETE /delete-credential
