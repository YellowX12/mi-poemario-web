This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment configuration

Create a `.env.local` file in the project root with the following values. You can use `env.example` as a template:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=secret
MYSQL_DATABASE=mi_poemario
MYSQL_PORT=3306
SESSION_SECRET=tu_secreto_super_seguro
```

Do not commit `.env.local` to Git.

## Database schema

Use this schema for the app tables:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE poemas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Opcional: Para likes/dislikes
CREATE TABLE poem_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poema_id INT,
  user_id INT,
  tipo ENUM('like', 'dislike'),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poema_id) REFERENCES poemas(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_like (poema_id, user_id)
);

-- Opcional: Para favoritos
CREATE TABLE favoritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poema_id INT,
  user_id INT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poema_id) REFERENCES poemas(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_fav (poema_id, user_id)
);

-- Opcional: Para comentarios
CREATE TABLE comentarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poema_id INT,
  user_id INT,
  contenido TEXT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poema_id) REFERENCES poemas(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
