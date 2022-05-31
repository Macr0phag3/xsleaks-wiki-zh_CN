FROM node:17.4.0-buster-slim

COPY app/ /app

WORKDIR /app

RUN yarn

USER node

CMD ["node", "app.js"]
