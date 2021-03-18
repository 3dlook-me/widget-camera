### Install all the dependencies
```sh
npm install
```

### Development
```sh
npm start
```

### Demo app

Execute the following command to run the app in a development envirinment:

```sh
npm install
npm start
```

then open link in your browser:

```
http://localhost:9000/demo.html
```

### Publish to nexus
```sh
1. npmrc nexus
2. npm run build
3. npm version <patch|minor|major> (if you need to up camera version)
    - use patch for fixes, docs and demos updates
    - use minor for new features which don’t break backward capabilities
    - use major for those changes which bring breaking changes
4. Commit current changes and push them to the repository. Also, push tags
    - git push
    - git push --tags
5. npm publish
```

# Prop Types
| Property | Type | Required? | Description
| ------ | ------ | :------: | ------ |
| isTableFlow | Boolean | ✓ | `true` photographing yourself, `false` taking pictures of a friend |
| disableTableFlow | Function | ✓ | Callback invoked whenever the gyroscope is disabled on the phone, disables the ability to take a photo of yourself. `(): void` |
| saveFront | Function | ✓ | Callback invoked whenever the front of the photo is saved. `(file): void` |
| saveSide | Function | ✓ | Callback invoked whenever the side of the photo is saved. `(file): void` |
| type | String | ✓ | The type of photo to be taken is either `front` or `side` |
| hardValidation | Object | ✓ | Front and side photo validation object. Format `{ front: null, side: null }` |
| onClickDone | Function || Callback invoked whenever the user clicks on the button 'Done' `(): void` |
| turnOffCamera | Function | ✓ | Callback invoked whenever the second photo is taken (you photograph yourself). Turns off the camera component when the audio track ends. `(): void` |
| setDeviceCoordinates | Function | ✓ | Callback on deviceorientation event. `({ betaX: 23.33, gammaY: 33.54, alphaZ: 65.32 }): void` |
