FROM node:22-alpine
WORKDIR /app
COPY package.json server.js ./
COPY public ./public
ARG GIT_SHA=dev
ENV GIT_SHA=$GIT_SHA NODE_ENV=production PORT=3000 DATA_DIR=/app/data
# Ordner für die Bestenliste (liegt auf dem Server auf einem Docker-Volume)
RUN mkdir -p /app/data && chown node:node /app/data
USER node
EXPOSE 3000
CMD ["node", "server.js"]
