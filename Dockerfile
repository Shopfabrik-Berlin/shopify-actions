FROM node:14.17.5-alpine3.14


COPY . /shopify-action
# Install themekit dependecies 
RUN cd /shopify-action && yarn install
RUN chmod +x /shopify-action/entrypoint.sh

ENTRYPOINT ["/shopify-action/entrypoint.sh"]
