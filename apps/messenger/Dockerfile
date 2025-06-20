# Check out https://hub.docker.com/_/node to select a new base image
FROM node:20.11-alpine
ARG port
ENV PORT=$port
ARG service
ENV SERVICE=$service
# Set to a non-root built-in user `node`
USER node
# Create app directory (with user `node`)
RUN mkdir -p /home/node/dist/${SERVICE}
WORKDIR /home/node/dist/${SERVICE}

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node package*.json ./
# Bundle app source code
COPY --chown=node . .

RUN yarn build:${SERVICE} && \
  yarn install --production --frozen-lockfile && \
  yarn prisma:gen:${SERVICE} && \
  yarn cache clean

# Bind to all network interfaces so that it can be mapped to the host OS

EXPOSE ${PORT}

CMD yarn 'start:messenger'
