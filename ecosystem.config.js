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
        // Inherit Compose/VPS: local compose = development; prod overlay = production.
        NODE_ENV: process.env.NODE_ENV || "production",
      },
    },
    {
      // Video transcode worker (BullMQ + ffmpeg).
      name: "gats-academy-worker",
      cwd: "./gats-academy",
      script: "npm",
      args: "run start:worker",
      env: {
        NODE_ENV: process.env.NODE_ENV || "production",
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
    {
      // Viava course AI (FastAPI). Bind 0.0.0.0 so an external reverse proxy can reach :8000.
      // BE inside this container uses http://127.0.0.1:8000.
      // interpreter: "none" — do NOT run the venv binary through Node (pm2 default).
      name: "viava-api",
      cwd: "./viava",
      script: "./.venv/bin/python",
      args: "-m uvicorn servers.rest_api.main:app --host 0.0.0.0 --port 8000",
      interpreter: "none",
      env: {
        RAG_WORK_DIR: "/app/viava/rag_data",
      },
    },
  ],
};
