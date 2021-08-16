FROM node:14.17.5-alpine3.14

RUN apk add --update ruby-dev
RUN apk add --update ruby
RUN gem install shopify-cli

COPY . /shopify-action
# Install themekit dependecies 
RUN cd /shopify-action && yarn install
RUN chmod +x /shopify-action/entrypoint.sh

ENTRYPOINT ["/shopify-action/entrypoint.sh"]
