// pm2 chạy trong container DEV (Dockerfile.dev).
// be + video worker + admin + fe đều là dev server (hot reload khi sửa file trên máy).
module.exports = {
  apps: [
    {
      name: "be",
      cwd: "/app/be",
      script: "npm",
      args: "run dev:watch",
      env: { NODE_ENV: "development" },
    },
    {
      name: "be-worker",
      cwd: "/app/be",
      script: "npm",
      args: "run dev:worker:watch",
      env: { NODE_ENV: "development" },
    },
    {
      // Admin dashboard listens on 3001 (matches docker-compose 3001:3001).
      name: "admin",
      cwd: "/app/admin",
      script: "npm",
      args: "run dev",
      env: { NODE_ENV: "development", PORT: 3001 },
    },
    {
      name: "fe",
      cwd: "/app/fe",
      script: "npm",
      args: "run dev",
      env: { NODE_ENV: "development" },
    },
  ],
};
