module.exports = {
  apps: [
    {
      name: "zl3tom",
      script: "./server.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "250M",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: "3000"
      }
    }
  ]
};
