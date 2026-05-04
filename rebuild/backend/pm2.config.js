module.exports = {
  apps: [{
    name: "nayamo-api",
    script: "./server.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "development",
      PORT: 5000
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 5000
    },
    log_date_format: "YYYY-MM-DD HH:mm Z",
    error_file: "./logs/pm2-error.log",
    out_file: "./logs/pm2-out.log",
    log_file: "./logs/pm2-combined.log",
    time: true,
    max_memory_restart: "1G",
    kill_timeout: 5000
  }]
};

