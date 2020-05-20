### Install all the dependencies 
```sh
1. npm install
```

### Development
```sh
2. npm start 
```

### Build project
```sh
3. npm run build 
```

### Publish to nexus (develop branch)
```sh
4. npmrc nexus
5. npm version patch 
6. npm publish
```

### Publish to npm (master branch)
```sh
7. npmrc default
8. npm version patch 
9. npm publish --access=public
```




