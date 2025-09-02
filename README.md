# GraphQL Blogging Platform

A simple **blogging platform** built with:

- [Apollo Server](https://www.apollographql.com/docs/apollo-server/) (GraphQL API)
- [Prisma](https://www.prisma.io/) (ORM & database access)
- [TypeScript](https://www.typescriptlang.org/) (type safety)
- [Express](https://expressjs.com/) (server integration)
- [graphql-ws](https://github.com/enisdenjo/graphql-ws) (WebSocket subscriptions)

This project is designed to be a **training/learning project**, inspired by platforms like Medium.  
It supports authentication, user accounts, posts, comments, likes, and GraphQL subscriptions.

---

## 🚀 Features

- User registration & authentication (JWT)
- Public vs. private GraphQL queries
- CRUD operations for posts, comments, and likes
- Prisma-powered relational data
- GraphQL subscriptions (real-time updates)
- TypeScript-based resolvers and models

---

## 📦 Installation

Clone the repo and install dependencies:

```bash
npm install
```

---

## ⚙️ Environment Setup

Create a .env file in the root directory with the following variables:
(or copy from the provided .env.example file)

⚠️ Make sure to replace values with your actual configuration. For development, you can use SQLite (file:./dev.db) as a quick start.

---

## 🛠️ Prisma Setup

Initialize Prisma and generate client:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## ▶️ Running the Project

Start the development server:
```bash
npm run start
```

By default, the GraphQL endpoint will be available at:
```bash
http://localhost:4000/graphql
```

---
✅ TODO / Next Steps

* Improve error handling
* Add integration tests
* Add total count for pagination
* Add interfaces for data types (Public & Private)
* Add a service layer, extract logic from resolvers