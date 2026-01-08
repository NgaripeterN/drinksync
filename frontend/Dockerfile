FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Command to run the development server will be in docker-compose.yml
CMD ["tail", "-f", "/dev/null"] # Keep container alive for local development mounting