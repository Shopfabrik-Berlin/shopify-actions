## Setup for new project:
1. Create master br and development from master.
2. Get workflows files for .github/ folder. Also you need to prepare secrets.
3. Prepare package.json
```
    "scripts": {
        "dev": "concurrently \"parcel watch app/scripts/index.js --dist-dir ./assets/bundle.min.js\" \"parcel watch app/styles/index.scss --dist-dir ./assets/style.min.css\" \"theme watch -e $env\"",
        "dev:ns": "concurrently \"parcel watch app/index.js --dist-dir ./assets\" \"theme watch -e development-ns\"",
        "build": "parcel build app/index.js --dist-dir ./assets --no-source-maps && parcel build app/styles/index.scss --dist-dir ./assets --no-source-maps",
        "clean": "rm -rf ./assets/index.dev.js && rm -rf ./assets/index.dev.css && rm -rf ./assets/*.map && rm -rf ./assets/*.parcel.*.js && rm -rf ./assets/*.parcel.*.css",
        "critical": "concurrently \"yarn critical:index\" ",
        "critical:index": "criticalcss --url=https://shopfabrik-ecommerce.myshopify.com --file=assets/theme.css.liquid --output=snippets/critical-index.min.css.liquid --ignoreConsole=true"
    },
    "dependencies": {
        "@parcel/plugin": "^2.2.1",
        "@sentry/browser": "^6.17.6",
        "@sentry/tracing": "^6.17.6",
        "cheerio": "^1.0.0-rc.10",
        "cypress": "^6.4.0",
        "grunt": "^1.1.0",
        "grunt-contrib-uglify": "^4.0.1",
        "jquery": "^3.6.0",
        "lazysizes": "^5.3.2",
        "parcel-namer-functional": "^0.1.3",
        "criticalcss": "filamentgroup/criticalCSS#master"
      },
      "devDependencies": {
        "@parcel/transformer-sass": "^2.1.1",
        "autoprefixer": "^10.4.12",
        "axios": "^0.25.0",
        "concurrently": "^7.0.0",
        "parcel": "^2.7",
        "postcss": "^8.4.16",
        "postcss-custom-properties": "^12.1.9",
        "postcss-import": "^15.0.0",
        "yargs": "^17.3.1",
        "cssnano": "^4.1.10",
        "sass": "^1.23.7"
      },
      "parcel-namer-functional": [
        {
          "type": "require",
          "file": "app/tools/renamer.js",
          "function": "pleaseRename"
        }
      ],
      "repository": "git@github.com:yours",
      "scripts": {
        "dev": "concurrently \"parcel watch app/scripts/index.js --dist-dir ./assets/bundle.min.js\" \"parcel watch app/styles/index.scss --dist-dir ./assets/style.min.css\" \"theme watch -e $env\"",
        "dev:ns": "concurrently \"parcel watch app/index.js --dist-dir ./assets\" \"theme watch -e development-ns\"",
        "build": "parcel build app/index.js --dist-dir ./assets --no-source-maps && parcel build app/styles/index.scss --dist-dir ./assets --no-source-maps",
        "clean": "rm -rf ./assets/index.dev.js && rm -rf ./assets/index.dev.css && rm -rf ./assets/*.map && rm -rf ./assets/*.parcel.*.js && rm -rf ./assets/*.parcel.*.css",
        "critical": "concurrently \"yarn critical:index\" ",
        "critical:index": "criticalcss --url=https://shop.myshopify.com --file=assets/theme.css.liquid --output=snippets/critical-index.min.css.liquid --ignoreConsole=true"
      },
```
4. Prepare config.yml
5. Prepare .gitignore
6. Prepare .parcelrc
```
{
  "extends": "@parcel/config-default",
  "namers": ["parcel-namer-functional"]
}
```
7. Prepare app structure
8. Add renamer.js to app/tools/
9. Add index.js to app/
#### Make sure that files which you are importing in the index.js don't have names with some dots inside, e.g.: page.about-us.js. It will not work!
10. Add index.scss to app/styles/
11. Also need to add index.js to app/pages/ , this file is used on the Home Page of a store
12. yarn install
13. yarn build

When you're working on your dev theme you're getting *.dev.js(css, map) outputs. If you're writting some js for a new page, you have to include scripts and styles to the index.js manually, also you have to add commands for creating critical css manually. Code splitting and critical css information is below.

## Code & Styles splitting:
It requests .js for the current page. Scss files are not compiling to css. Parcel takes code from a scss file and includes classes to the body.

In the main index.js file (EXAMPLE):

    const template = window.theme.template;
    if (template == 'page.about-us') {
        // Styles splitting
        import('./styles/pages/about-us.scss').then(function (classes) {
            document.body.className = classes.body;
        }).catch(function (error) {
            console.warn(error);
        });
        
        // Code splitting
        import("./pages/about-us.js").then(function (page) {
            // run your scripts
        });
    } 


Routes to files can be anything you like. I offer the next structure:
- app
    - pages
    - modules => for reusing inside of /pages
    - components => for reusing inside of /pages
    - tools => some stuff for build e.g. renamer.js
    - index.js

## Critical css:
Needed for the live theme.
It analyzes elements in the viewport and takes styles for them from --file to improve FCP. --file - minified styles from app/styles/index.scss. This file is built in the production-deploy action. CSS is stored as snippets for server-side rendering, this way is faster.

1. In the "scripts" of package.json . Just follow the examples below.
```
"critical": "concurrently \"yarn critical:index\" \"yarn critical:about\" \"yarn critical:cdp\" ",

"critical:index": "criticalcss --url=https://shopfabrik-ecommerce.myshopify.com --file=assets/all-styles.css --output=snippets/critical-index.min.css.liquid --ignoreConsole=true"

"critical:about": "criticalcss --url=https://shopfabrik-ecommerce.myshopify.com/pages/about --file=assets/all-styles.min.css --output=snippets/critical-about.min.css.liquid --ignoreConsole=true"

"critical:cdp": "criticalcss --url=https://shopfabrik-ecommerce.myshopify.com/collections/all --file=assets/all-styles.css --output=snippets/critical-collections-all.min.css.liquid --ignoreConsole=true"
```
2. In the snippets/critical-style-controller.liquid:
```
{% assign handle = template.name | append: '.' | append: template.suffix %}
{% assign isCritical = false %}
{% case handle %}
  {% when 'index.' %}
    {% assign isCritical = true %}
    <style>
      {% render 'critical-index.min.css'%}
    </style>
  {% when 'page.about' %}
    {% assign isCritical = true %}
    <style>
      {% render 'critical-page-about.min.css'%}
    </style>
  {% when 'collection.all' %}
    {% assign isCritical = true %}
    <style>
      {% render'critical-collections-all.min.css'%}
    </style>
  {% else %}
{% endcase %}

{% unless isCritical %}
  {% comment %} 'theme.css' - standart styles {% endcomment %}
  <link rel="preload" href="{{ 'theme.min.css' | asset_url }}" as="style" onload="this.onload=null;this.rel='stylesheet'">
{% else %}
  {{ 'theme.min.css' | asset_url | stylesheet_tag }}
{% endunless %}
```

'theme.min.css' - shouldn't be included in the theme.liquid, only critical-style-controller.liquid

3. "critical-style-controller.liquid" must be included in the theme.liquid.

4. Include these styles to the app/styles/index.scss/

## After duplicating live to a new theme:
1. Remove *.parcel.*.js (css) files before doing a new build. You can use yarn clean to do this, but it doesn't work on Windows 

### To improve:
1. yarn clean doesn't work on Windows, because some commands like rm isn't supported there. So we should resolve it somehow.
2. Criticalcss: if url is /product/product-handle? How we can define criticalcss for the list of urls, because lots of products can use 1 template?
3. Get rid of deprecated stuff
