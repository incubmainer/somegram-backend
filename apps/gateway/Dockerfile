FROM node:20-alpine AS development
WORKDIR /usr/src/app
RUN chown node:node /usr/src/app
USER node
COPY --chown=node:node package.json yarn.lock /usr/src/app/
RUN yarn install --frozen-lockfile
COPY --chown=node:node . .

FROM node:20-alpine AS build
WORKDIR /usr/src/app
RUN chown node:node /usr/src/app
USER node
COPY --chown=node:node package.json yarn.lock /usr/src/app/
COPY --chown=node:node --from=development /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node . .
RUN yarn build:gateway && \
  yarn install --production --frozen-lockfile && \
  yarn prisma:gen:gateway && \
  yarn cache clean

FROM node:20-alpine AS production
WORKDIR /usr/src/app
RUN chown node:node /usr/src/app
ARG port
ENV PORT=$port
ENV NODE_ENV=production
USER node
COPY --chown=node:node package.json /usr/src/app/
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node --from=build /usr/src/app/dist /usr/src/app/dist
ENTRYPOINT [ "yarn", "start:gateway" ]
