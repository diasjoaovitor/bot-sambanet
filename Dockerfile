FROM node:iron-bullseye

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libgtk-3-0 \
    libpango-1.0-0 \
    libcairo2 \
    libx11-xcb1 \
    libxtst6 \
    libnss3-dev \
    fonts-liberation \
    ca-certificates \
    lsb-release \
    wget \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

RUN npx playwright install-deps

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

RUN npm run build

CMD ["npm", "run", "start"]
