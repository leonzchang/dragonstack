FROM node:latest
LABEL maintainer = "leonz"

WORKDIR /dragonstack-frontend

COPY . .
RUN yarn install

EXPOSE 1234
CMD [ "yarn", "start" ]