#!/bin/sh
mkdir -p settings_locale/{de,fr,nl} && \
theme get --password=$SHOPIFY_PASSWORD_NL --store=$SHOPIFY_STORE_URL_NL --themeid=$SHOPIFY_THEME_ID_NL --dir=$THEME_PATH/settings_locale/nl config/settings_data.json $INPUT_ARGS -e production-nl && \
theme get --password=$SHOPIFY_PASSWORD_FR --store=$SHOPIFY_STORE_URL_FR --themeid=$SHOPIFY_THEME_ID_FR --dir=$THEME_PATH/settings_locale/fr config/settings_data.json $INPUT_ARGS -e production-fr && \
theme get --password=$SHOPIFY_PASSWORD --store=$SHOPIFY_STORE_URL --themeid=$SHOPIFY_THEME_ID --dir=$THEME_PATH/settings_locale/de config/settings_data.json $INPUT_ARGS -e production && \
theme get --password=$SHOPIFY_PASSWORD --store=$SHOPIFY_STORE_URL --themeid=$SHOPIFY_THEME_ID --dir=$THEME_PATH --ignored-file=config/settings_data.json $INPUT_ARGS -e production
