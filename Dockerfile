FROM node:22-alpine
WORKDIR /app
COPY package.json server.js ./
ARG GIT_SHA=dev
ENV GIT_SHA=$GIT_SHA NODE_ENV=production PORT=3000
USER node
EXPOSE 3000
CMD ["node", "server.js"]
