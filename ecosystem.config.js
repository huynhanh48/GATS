module.exports = {
  apps: [
    {
      // Backend API — run via npm so module-alias (@src) + dotenv are registered
      // exactly like the production `start` script does.
      name: "gats-be",
      cwd: "./be",
      script: "npm",
      args: "start",
      env: {
        // Inherit Compose/VPS: local compose = development; prod overlay = production.
        NODE_ENV: process.env.NODE_ENV || "production",
      },
    },
    {
      // Video transcode worker (BullMQ + ffmpeg).
      name: "gats-be-worker",
      cwd: "./be",
      script: "npm",
      args: "run start:worker",
      env: {
        NODE_ENV: process.env.NODE_ENV || "production",
      },
    },
    {
      name: "gats-admin",
      cwd: "./admin",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        // Bind all interfaces so host port mapping (3001:3001) works.
        HOSTNAME: "0.0.0.0",
      },
    },
    {
      // fe là SPA tĩnh: `vite build` -> fe/dist, phục vụ bằng `serve -s`
      // (-s = single-page app: mọi route đều trả index.html cho react-router).
      // PHẢI dùng đường dẫn tuyệt đối: pm2 coi `script: "serve"` là module
      // static server nội bộ của nó (lib/API/Serve.js) nên process sẽ crash
      // liên tục với `Error: getaddrinfo ENOTFOUND -l`.
      // `serve` được cài global trong Dockerfile -> /usr/local/bin/serve.
      name: "gats-fe",
      cwd: "./fe",
      script: "/usr/local/bin/serve",
      args: "-s dist -l 3002",
    },
  ],
};
