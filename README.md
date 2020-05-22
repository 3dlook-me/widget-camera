### Install all the dependencies 
```sh
npm install
```

### Development
```sh
npm start 
```

### Publish to nexus (develop branch)
```sh
1. npmrc nexus
2. npm run build 
3. npm version patch 
4. npm publish
```

### Publish to npm (master branch)
```sh
1. npmrc npm-camera
2. npm run build 
3. npm version patch 
4. npm publish --access=public
```




