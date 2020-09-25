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
3. npm version patch (if you need to up camera version)
4. npm publish
```

### Publish to npm (master branch)
```sh
1. npmrc npm-camera
2. npm run build 
3. npm version patch (if you need to up camera version)
4. npm publish --access=public
```

[Demo](https://codesandbox.io/s/modern-bird-7bztd) when taking a photo of a friend

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