## Setup for new project:
1. Create master br and development from master.
2. Get workflows files for .github/ folder. Also you need to prepare secrets.

    2.1 For the preview deploy: if you want to take data from /temlates, /config etc dynamic data from your dev theme to created preview, just use e.g. dev-ns-theme_ID label for a PullRequest.
    
    2.2 If you don't need a theme preview, just use "No Preview" label for you PR


3. Prepare package.json from the https://github.com/Shopfabrik-Berlin/shopify-theme-starter
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
#### Make sure that files which you are importing in the index.js don't have names with some dots inside, e.g.: page.about-us.js (css/scss). It will not work!
10. Add index.scss to app/styles/
11. Also need to add index.js to app/pages/ , this file is used on the Home Page of a store
12. yarn install
13. yarn build

When you're working on your dev theme you're getting *.dev.js(css, map) outputs. If you're writting some js for a new page, you have to include scripts and styles to the index.js manually, also you have to add commands for creating critical css manually. Code splitting and critical css information is below.

## Index.js
Including to theme.liquid:

Before the title tag
```
<link rel="modulepreload" href="{{ 'index.js' | asset_url }}" />
```
    
Before closing of the head tag
```
<script src="{{ 'index.js' | asset_url }}" defer="defer"></script>
```

Include heplers inside of the head tag:
```
<script>
  var theme = {
    stylesheet: "{{ 'theme.css' | asset_url }}",
    template: {{ template | json }},
    routes: {
      home: "{{ routes.root_url }}",
      cart: "{{ routes.cart_url }}",
      cartAdd: "{{ routes.cart_add_url | append: '.js'}}",
      cartChange: "{{ routes.cart_change_url }}"
    },
    strings: {
      addToCart: {{ 'products.product.add_to_cart' | t | json }},
      soldOut: {{ 'products.product.sold_out' | t | json }},
      unavailable: {{ 'products.product.unavailable' | t | json }},
      regularPrice: {{ 'products.general.regular_price' | t | json }},
      salePrice: {{ 'products.general.sale_price' | t | json }},
      stockLabel: {{ 'products.product.stock_label' | t: count: '[count]' | json }},
      willNotShipUntil: {{ 'products.product.will_not_ship_until' | t: date: '[date]' | json }},
      willBeInStockAfter: {{ 'products.product.will_be_in_stock_after' | t: date: '[date]' | json }},
      waitingForStock: {{ 'products.product.waiting_for_stock' | t | json }},
      cartItems: {{ 'cart.general.item_count' | t: count: '[count]' | json }},
      cartConfirmDelete: {{ 'cart.general.delete_confirm' | t | json }},
      cartTermsConfirmation: {{ 'cart.general.terms_confirm' | t | json }}
    }
  };

  document.documentElement.className = document.documentElement.className.replace('no-js', 'js');
</script>
```

## Code & Styles splitting:
It requests .js for the current page. Scss files are not compiling to css. Parcel takes code from a scss file and includes classes to the body.

In the main index.js file (EXAMPLE):
    import isSection from './tools/isSection.js';

    const template = window.theme ? window.theme.template : null;
    const pageType = window.theme ? window.theme.pageType : null;
    const isCheckout = Shopify ? Shopify.Checkout : null; // to import styles and scripts for the checkout page
    
    const selectors = {
        sections: {
            videoBanner: '.video-banner'
        }
    }
    
    // Split by section
    if (isSection(selectors.sections.videoBanner)) {
        import('./styles/sections/video-banner.scss').catch(function (error) {
            console.warn(error);
        });
        
        import("./components/video.js").catch(function (error) {
            console.warn(error);
        });
    }
    
    // Split by page
    if (template == 'page.about-us') {
        // Styles splitting
        import('./styles/pages/about-us.scss').catch(function (error) {
            console.warn(error);
        });
        
        // Code splitting
        import("./pages/about-us.js").catch(function (error) {
            console.warn(error);
        });
    } 


Routes to files can be anything you like. I offer the next structure:
- app
    - styles
        - sections
        - index.scss
    - modules
    - components
    - tools => some stuff for build e.g. renamer.js
    - index.js

## Critical css:
Needed for the live theme.
It analyzes elements in the viewport and takes styles for them to improve FCP. CSS are stored as snippets for the server-side rendering, this way is faster.

1. In the "scripts" of package.json . Just follow the examples below.
```
"critical": "concurrently \"yarn critical:index\" \"yarn critical:product\"",
"critical:index": "critical https://your-store.com --dimensions 1300x900 --dimensions 425x800 > snippets/critical-index.min.css.liquid",
"critical:product": "critical https://your-store.com/products/some-product --dimensions 1300x900 --dimensions 425x800 > snippets/critical-product.min.css.liquid"
```
2. Add snippets/critical-style-controller.liquid to the theme.liquid
3. Add big common css files with preloading to the theme.liquid:
HEAD tag:
```
<link rel="preload" id="base-css" href="{{ 'base.css' | asset_url }}" as="style"/>
<link rel="preload" id="index-css" href="{{ 'index.css' | asset_url }}" as="style"/>
```
on window.load:
```
window.addEventListener('load',function(){ 
    var baseCss = document.getElementById('base-css');
    if (baseCss) {
        baseCss.rel = 'stylesheet';
    }
    var indexCss = document.getElementById('index-css');
        if (indexCss) {
        indexCss.rel = 'stylesheet';
    }
});
```

## After duplicating live to a new theme:
1. Remove *.parcel.*.js (css) files before doing a new build. You can use yarn clean to do this, but it doesn't work on Windows 

### To improve:
1. yarn clean doesn't work on Windows, because some commands like rm isn't supported there. So we should resolve it somehow.
2. Get rid of deprecated stuff
