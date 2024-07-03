# Check out https://hub.docker.com/_/node to select a new base image
FROM node:20.11-alpine
ARG port
ARG service
ENV SERVICE=$service
ENV PORT=$port
# Set to a non-root built-in user `node`

RUN mkdir -p /app
RUN chown node:node /app

USER node

WORKDIR /app

COPY --chown=node package.json ./
COPY --chown=node yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build:${SERVICE}

EXPOSE ${PORT}

CMD yarn start:${SERVICE}
