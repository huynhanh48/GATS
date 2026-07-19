module.exports = {
  apps: [
    {
      // Backend API — run via npm so module-alias (@src) + dotenv are registered
      // exactly like the production `start` script does.
      name: "gats-academy-api",
      cwd: "./gats-academy",
      script: "npm",
      args: "start",
      env: {
        // development so BootstrapService seeds sample courses/posts/admin.
        NODE_ENV: "development",
      },
    },
    {
      // Video transcode worker (BullMQ + ffmpeg).
      name: "gats-academy-worker",
      cwd: "./gats-academy",
      script: "npm",
      args: "run start:worker",
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "web-app",
      cwd: "./web-app",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3005,
      },
    },
    {
      name: "admin-dashboard",
      cwd: "./admin-dashboard",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 9000,
      },
    },
  ],
};
