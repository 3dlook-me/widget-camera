import { h } from 'preact';

import { IOS_GUIDE, ANDROID_GUIDE } from './guideConstants';

import './AccessGuide.scss';
import arrow from '../../images/ic_try.svg';

const AccessGuide = ({ isAndroid }) => {
  const GUIDE = isAndroid ? ANDROID_GUIDE : IOS_GUIDE;

  return (
    <div className="access-guide">
      <ul className="access-guide__container">

        {GUIDE.map((el, index) => (
          <li className="access-guide__item">
            <p className="access-guide__text">
              {`${index + 1}. `}
              {el.text}
            </p>
            <figure className="access-guide__img-wrap">
              <img src={el.image} alt="screen" />
            </figure>
          </li>
        ))}

      </ul>

      <div className="access-guide__btn-wrap">
        <a className="access-guide__btn" href="/camera-mode-selection">
          <img src={arrow} alt="arrow" />
          Try again
        </a>
      </div>
      <div />
    </div>
  );
};

export default AccessGuide;
