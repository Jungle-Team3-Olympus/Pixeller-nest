#!/bin/bash
REPOSITORY=/home/ubuntu/nest-app # 배포된 프로젝트 경로.

cd $REPOSITORY # 이 경로로 이동해서 밑에 명령어들을 차례로 실행.

sudo npm install --legacy-peer-deps # 의존성 파일 설치.
sudo npm install -g pm2@latest
sudo pm2 stop nest-app || true # 기존에 실행 중인 프로세스가 있다면 중지
sudo pm2 delete nest-app || true # 기존에 실행 중인 프로세스가 있다면 삭제
sudo pm2 start nest --name "nest-app" -- start # 애플리케이션에 이름을 부여하여 시작
# sudo pm2 start ecosystem.config.js
sudo pm2 save # 현재 실행 중인 프로세스 목록 저장