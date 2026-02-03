

# Base
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

RUN npm ci

EXPOSE 3000

# Development
FROM base AS development
ENV NODE_ENV development
RUN npm install 

COPY . .

CMD ["npm", "run", "dev"]

# Production
FROM base AS production
ENV NODE_ENV production

COPY . .

CMD ["npm", "start"]