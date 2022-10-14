## Setup for new project:
1. Create master br and development from master.
2. Get workflows files for .github/ folder. Also you need to prepare secrets.
3. Prepare package.json
4. Prepare config.yml
5. Prepare .gitignore
6. Prepare .parcelrc
7. Prepare app structure
8. Add renamer.js to app/tools/
9. Add index.js to app/
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
{% case handle %}
  {% when 'index.' %}
    <style>
      {% render 'critical-index.min.css'%}
    </style>
  {% when 'page.about' %}
    <style>
      {% render 'critical-page-about.min.css'%}
    </style>
  {% when 'collection.all' %}
    <style>
      {% render'critical-collections-all.min.css'%}
    </style>
  {% else %}
{% endcase %}
```
3. "critical-style-controller.liquid" must be included in the theme.liquid.

4. Include these styles to the app/styles/index.scss/

## After duplicating live to a new theme:
1. Remove *.parcel.*.js (css) files before doing a new build. You can use yarn clean to do this, but it doesn't work on Windows 

### To improve:
1. yarn clean doesn't work on Windows, because some commands like rm isn't supported there. So we should resolve it somehow.
2. Criticalcss: if url is /product/product-handle? How we can define criticalcss for the list of urls, because lots of products can use 1 template?
3. Get rid of deprecated stuff
