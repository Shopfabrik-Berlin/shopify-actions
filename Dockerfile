FROM python:2.7-alpine

RUN apk add --update curl
RUN curl -s https://shopify.dev/themekit.py | python

COPY "entrypoint.sh" "/entrypoint.sh"
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
