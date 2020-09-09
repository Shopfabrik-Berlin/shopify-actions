#!/bin/sh
if [ -n "$SHOPIFY_LOCALE" ]; then
    echo "locale defined"
    mkdir -p settings_locale/$SHOPIFY_LOCALE
    theme get --password=$SHOPIFY_PASSWORD --store=$SHOPIFY_STORE_URL --themeid=$SHOPIFY_THEME_ID --dir=$THEME_PATH/settings_locale/$SHOPIFY_LOCALE config/settings_data.json $INPUT_ARGS -e production-$SHOPIFY_LOCALE && \
    theme get --password=$SHOPIFY_PASSWORD --store=$SHOPIFY_STORE_URL --themeid=$SHOPIFY_THEME_ID --dir=$THEME_PATH --ignored-file=config/settings_data.json $INPUT_ARGS -e production
else
    echo "locale is empty"
    theme get --password=$SHOPIFY_PASSWORD --store=$SHOPIFY_STORE_URL --themeid=$SHOPIFY_THEME_ID --dir=$THEME_PATH $INPUT_ARGS -e production
fi
