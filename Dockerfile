FROM node:20-alpine AS base

WORKDIR /app

COPY package.json tsconfig.json jest.config.cjs ./
COPY src ./src
COPY tests ./tests
COPY hcm ./hcm

RUN npm install
RUN npm run build

CMD ["sh", "-c", "npm test && node dist/demo.js"]

