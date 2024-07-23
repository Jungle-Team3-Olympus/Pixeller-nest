module.exports = {
  apps : [{
    name: "nest-app",
    script: "nest",
    args: "start",
    instances: 1,
    exec_mode: "fork",
    watch: false,
    max_memory_restart: "28G",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    },
    node_args: "--max-old-space-size=28672"
  }]
}