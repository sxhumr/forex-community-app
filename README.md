# Forex Community App

## Overview

The Forex Community App is a secure, invite-only community platform built as a portfolio and client-style project. It is designed to provide a private, moderated space for Forex traders to communicate, share insights, and engage in structured discussions.

The application combines ideas from platforms such as Telegram and Discord, while placing a strong emphasis on access control, account verification, and security. It is intended to represent a real-world production system rather than a simple chat demo.

---

## Background and Motivation

The motivation for this project came from observing how many Forex trading communities rely on unsecured messaging platforms and public chat groups. These environments often suffer from impersonation, lack of moderation, unverified users, data leaks, and poor control over who can access sensitive trading discussions.

This project was designed to explore how a private, verified, and security-conscious community platform could be built using modern web technologies. The goal was to create a system where trust, access control, and moderation are treated as first-class concerns rather than afterthoughts.

---

## Core Concept

The application is built around the idea of a closed Forex community. Users are required to register, verify their identity through email and one-time passwords, and gain approval before accessing the community. An administrator oversees the platform, manages users, and moderates discussions.

The system is intentionally designed to discourage casual misuse and promote a controlled, professional environment for traders.

---

## Tech Stack

### Backend

Node.js  
Express.js  
MongoDB  
Mongoose  
JWT Authentication  
dotenv  

### Frontend

React  
Tailwind CSS  
Vite  
Axios  

---

## Project Structure

backend/
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── server.js
└── package.json



### Frontend

frontend/
├── src/
│ ├── components/
│ ├── pages/
│ ├── context/
│ ├── services/
│ ├── App.jsx
│ └── main.jsx
└── package.json


The project follows a clear separation of concerns, with authentication logic, business logic, and routing kept modular and maintainable.

---

## Key Features

The platform supports secure user registration and login with email verification and one-time passwords, role-based access control with administrative privileges, private community chat functionality, and a security-focused design that considers risks such as unauthorised access and data exposure.

---

## Security Considerations

Sensitive configuration values are stored in environment variables and are not committed to the repository. Authentication is handled using token-based mechanisms, and access to the community is restricted to verified users only.

The application is designed with the assumption that community trust and data integrity are critical, particularly in financial discussion environments.

---

## Running the Project Locally

### Backend Setup

cd backend
npm install
npm run dev


Create a `.env` file inside the backend directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret


---

### Frontend Setup

cd frontend
npm install
npm run dev


Ensure the frontend is configured to communicate with the backend API.

---

## Current Status

The application is actively under development. Core authentication, user management, and foundational architecture are in place, with additional features and refinements planned as the project evolves.

## Future Improvements

Planned extensions include enhanced moderation tools, richer community features, improved real-time communication, stronger client-side security controls, and deployment to a production environment.

---

## Why This Project Matters

This project demonstrates my ability to design and build a secure, full-stack system with real-world constraints. It highlights system design thinking, security awareness, and the ability to translate abstract requirements into a structured and maintainable application.

It represents a more complex and realistic portfolio project than a standard tutorial application, focusing on trust, access control, and long-term scalability.


