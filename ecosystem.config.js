module.exports = {
    apps : [{
      name: "nest-app",
      script: "nest",
      args: "start",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "24G", // 인스턴스당 최대 메모리 사용량을 24GB로 설정
      env: {
        NODE_ENV: "production",
      },
      node_args: "--max-old-space-size=24576" // 24GB로 Node.js 메모리 제한 설정 (24 * 1024 = 24576)
    }]
  }