import { h } from 'preact';

import { IOS_GUIDE, ANDROID_GUIDE } from './guideConstants';

import './AccessGuide.scss';

const AccessGuide = ({ isAndroid }) => {
  const GUIDE = isAndroid ? ANDROID_GUIDE : IOS_GUIDE;

  return (
    <div className="access-guide">
      <ol className="access-guide__container">

        {GUIDE.map((el) => (
          <li className="access-guide__item">
            <p className="access-guide__text">{el.text}</p>
            <figure className="access-guide__img-wrap">
              <img src={el.image} alt="screen" />
            </figure>
          </li>
        ))}

      </ol>

      <div className="access-guide__btn-wrap">
        <a className="access-guide__btn" href="/#/camera-mode-selection">Try again</a>
      </div>
      <div />
    </div>
  );
};

export default AccessGuide;
