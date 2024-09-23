# 기본 이미지 설정
FROM node:22

# 빌드 시 필요한 변수
ARG DB_HOST
ARG DB_PORT
ARG DB_USER
ARG DB_PASSWORD
ARG DB_NAME
ARG JWT_SECRET
ARG NODE_ENV
ARG NAVER_MAP_API_ID
ARG NAVER_MAP_API_SECRET
ARG BUCKET_ACCESS_KEY
ARG BUCKET_NAME
ARG BUCKET_SECRET_KEY
ARG BUCKET_REGION
ARG OPENAI_API_KEY
# 환경 변수 설정
ENV DB_HOST=$DB_HOST \
    DB_PORT=$DB_PORT \
    DB_USER=$DB_USER \
    DB_PASSWORD=$DB_PASSWORD \
    DB_NAME=$DB_NAME \
    JWT_SECRET=$JWT_SECRET \
    NODE_ENV=$NODE_ENV \
    NAVER_MAP_API_ID=$NAVER_MAP_API_ID \
    NAVER_MAP_API_SECRET=$NAVER_MAP_API_SECRET \
    BUCKET_ACCESS_KEY=$BUCKET_ACCESS_KEY \
    BUCKET_NAME=$BUCKET_NAME \
    BUCKET_SECRET_KEY=$BUCKET_SECRET_KEY \
    BUCKET_REGION=$BUCKET_REGION \
    OPENAI_API_KEY=$OPENAI_API_KEY
# 작업 디렉터리 설정
WORKDIR /usr/src/app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 애플리케이션 소스 복사
COPY . .

# 애플리케이션 빌드
RUN npm run build

# 애플리케이션 실행
CMD ["node", "dist/main"]