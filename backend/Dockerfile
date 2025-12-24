FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Create directory for SQLite database
RUN mkdir -p /app/data

# Set environment variable for database path
ENV DB_PATH=/app/data/amep.db

EXPOSE 5000

CMD ["npm", "start"]