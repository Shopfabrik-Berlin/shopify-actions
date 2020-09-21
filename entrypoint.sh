#!/bin/sh
# Check for locale
if [ -n "$SHOPIFY_LOCALE" ]; then
    echo "locale defined"
    if { [ -n "$TASK" ] && [ "$TASK" = "BACKUP" ] ;} then
    # Check task is set and back -> do Backup
        echo "Making a backup to $SHOPIFY_STORE_URL on locale: $SHOPIFY_LOCALE"
        mkdir -p ./settings_locale/$SHOPIFY_LOCALE
        theme download --password=$SHOPIFY_PASSWORD --store=$SHOPIFY_STORE_URL --themeid=$SHOPIFY_THEME_ID --dir=./settings_locale/$SHOPIFY_LOCALE config/settings_data.json && \
        theme download --password=$SHOPIFY_PASSWORD --store=$SHOPIFY_STORE_URL --themeid=$SHOPIFY_THEME_ID --ignored-file=config/settings_data.json
    elif { [ -n "$TASK" ] && [ "$TASK" = "DEPLOY" ] ;} then
    # Check task is set and back -> do Deploy
        echo "Deploying $SHOPIFY_STORE_URL"
        theme deploy --password=$SHOPIFY_PASSWORD --store=$SHOPIFY_STORE_URL --themeid=$SHOPIFY_THEME_ID --nodelete --allow-live --ignored-file config/settings_data.json locales
    fi
else
    echo "locale is empty"
    if { [ -n "$TASK" ] && [ "$TASK" = "BACKUP" ] ;} then
        echo "Making a backup for $SHOPIFY_STORE_URL"
        theme download --password=$SHOPIFY_PASSWORD --store=$SHOPIFY_STORE_URL --themeid=$SHOPIFY_THEME_ID
    elif { [ -n "$TASK" ] && [ "$TASK" = "DEPLOY" ] ;} then
        echo "Deploying $SHOPIFY_STORE_UL"
        theme deploy --password=$SHOPIFY_PASSWORD --store=$SHOPIFY_STORE_URL --themeid=$SHOPIFY_THEME_ID --nodelete --allow-live --ignored-file config/settings_data.json locales
    fi
fi