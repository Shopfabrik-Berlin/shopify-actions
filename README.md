Setup for new project:
1. Create master br and development from master.
2. Get workflows files for .github/ folder.
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

After duplicating live to a new theme:
1. Remove *.parcel.*.js (css) files before doing a new build. You can use yarn clean to do this, but it doesn't work on Windows


To improve:
1. yarn clean doesn't work on Windows, because some commands like rm isn't supported there. 
So we shold resolve it somehow