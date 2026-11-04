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
      name: "admin",
      cwd: "/app/admin",
      script: "npm",
      args: "run dev",
      env: { NODE_ENV: "development" },
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
