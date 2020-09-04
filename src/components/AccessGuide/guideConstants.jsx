import { h } from 'preact';

import ios_1 from '../../images/ios-1.png';
import ios_2 from '../../images/ios-2.png';
import ios_3 from '../../images/ios-3.png';
import ios_4 from '../../images/ios-4.png';

import android_1 from '../../images/android-1.png';
import android_2 from '../../images/android-2.png';
import android_3 from '../../images/android-3.png';
import android_4 from '../../images/android-4.png';
import android_5 from '../../images/android-5.png';
import android_6 from '../../images/android-6.png';

export const IOS_GUIDE = [
  {
    text: ['Open', <b> “Settings” </b>],
    image: ios_1,
  }, {
    text: ['Scroll down and click', <b> “Safari” </b>],
    image: ios_2,
  }, {
    text: ['Scroll down and click', <b> “Camera” </b>],
    image: ios_3,
  }, {
    text: [
      'You need to choose an option:',
      <br />,
      <p>
        <b> “Ask” - </b>
        you will be notified each time you need to use the camera on your browser.
      </p>,
      <p>
        <b> “Allow” - </b>
        browser will have access to your camera without any restrictions
      </p>,
    ],
    image: ios_4,
  }];

export const ANDROID_GUIDE = [
  {
    text: ['Click on', <b> “Menu button” </b>, 'in your Chrome'],
    image: android_1,
  }, {
    text: ['Scroll down and click', <b> “Settings” </b>],
    image: android_2,
  }, {
    text: ['Scroll down and click', <b> “Site settings” </b>],
    image: android_3,
  }, {
    text: ['Scroll down and click', <b> “Camera” </b>],
    image: android_4,
  }, {
    text: ['Choose our site'],
    image: android_5,
    widget_host: window.location.origin,
  }, {
    text: ['Click', <b> “Clear & reset” </b>, 'button'],
    image: android_6,
  }];
