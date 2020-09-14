#!/bin/sh
# Check for locale
if [ -n "$SHOPIFY_LOCALE" ]; then
    echo "locale defined"
    if { [ -n "$TASK" ] && [ "$TASK" = "BACKUP" ] ;} then
    # Check task is set and back -> do Backup
        echo "Making a backup to $SHOPIFY_STORE_URL on locale: $SHOPIFY_LOCALE"
        mkdir -p settings_locale/$SHOPIFY_LOCALE
        theme get --password=$SHOPIFY_PASSWORD --store=$SHOPIFY_STORE_URL --themeid=$SHOPIFY_THEME_ID --dir=$THEME_PATH/settings_locale/$SHOPIFY_LOCALE config/settings_data.json $INPUT_ARGS -e production-$SHOPIFY_LOCALE && \
        theme get --password=$SHOPIFY_PASSWORD --store=$SHOPIFY_STORE_URL --themeid=$SHOPIFY_THEME_ID --dir=$THEME_PATH --ignored-file=config/settings_data.json $INPUT_ARGS -e production-$SHOPIFY_LOCALE
    elif { [ -n "$TASK" ] && [ "$TASK" = "DEPLOY" ] ;} then
    # Check task is set and back -> do Deploy
    # Be sure to set environment i.e production, development
        echo "Deploying to $ENVIRONMENT envrionment on $SHOPIFY_LOCALE"
        theme deploy -e $ENVIRONMENT-$SHOPIFY_LOCALE --allow-live --config config.yml --dir settings_locale/$SHOPIFY_LOCALE config/settings_data.json && \
        theme deploy -e $ENVIRONMENT-$SHOPIFY_LOCALE --allow-live --ignored-file config/settings_data.json
    fi
else
    echo "locale is empty"
    if { [ -n "$TASK" ] && [ "$TASK" = "BACKUP" ] ;} then
        echo "Making a backup to $ENVIRONMENT environment on $SHOPIFY_STORE_URL"
        theme get --password=$SHOPIFY_PASSWORD --store=$SHOPIFY_STORE_URL --themeid=$SHOPIFY_THEME_ID --dir=$THEME_PATH $INPUT_ARGS -e production
    elif { [ -n "$TASK" ] && [ "$TASK" = "DEPLOY" ] ;} then
        echo "Deploying to $ENVIRONMENT environment on $SHOPIFY_STORE_UL"
        theme deploy -e $ENVIRONMENT --allow-live
    fi
fi
