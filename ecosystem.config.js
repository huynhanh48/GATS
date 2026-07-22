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
        // Inherit Compose/VPS env; do not force development (cookie Secure, Helmet…).
        NODE_ENV: "production",
      },
    },
    {
      // Video transcode worker (BullMQ + ffmpeg).
      name: "gats-academy-worker",
      cwd: "./gats-academy",
      script: "npm",
      args: "run start:worker",
      env: {
        NODE_ENV: "production",
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
        // Bind all interfaces so host port mapping (3005:3005) works.
        HOSTNAME: "0.0.0.0",
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
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
