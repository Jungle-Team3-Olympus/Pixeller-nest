#!/bin/bash
REPOSITORY=/home/ubuntu/nest-app # 배포된 프로젝트 경로.

cd $REPOSITORY # 이 경로로 이동해서 밑에 명령어들을 차례로 실행.

# 기존 프로세스 중지 및 삭제
sudo pm2 stop nest-app || true
sudo pm2 delete nest-app || true

# 빌드 캐시 및 의존성 패키지 정리
sudo rm -rf node_modules
sudo rm -rf dist
sudo npm cache clean --force

# 의존성 파일 재설치
sudo npm install --legacy-peer-deps

# PM2 설치 (이미 설치되어 있다면 업데이트)
sudo npm install -g pm2@latest

# 환경 변수 재설정 (필요한 경우)
# source /path/to/your/env/file

# 애플리케이션 빌드
sudo npm run build

# 로그 파일 정리 (PM2 로그)
sudo pm2 flush

# 애플리케이션 시작
sudo pm2 start dist/main.js --name "nest-app"

# 현재 실행 중인 프로세스 목록 저장
sudo pm2 save
