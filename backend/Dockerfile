FROM node:latest
MAINTAINER leonz

WORKDIR /dragonstack-api

COPY . .
RUN yarn install && yarn build

EXPOSE 3000
CMD [ "yarn", "run-dev" ]