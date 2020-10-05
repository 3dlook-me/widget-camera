import { h } from 'preact';
import classNames from 'classnames';

import './AllowFrameTF.scss';

import grade from '../../images/grade-tf.svg';
import pointer from '../../images/arrows-tf.svg';

const AllowFrameTF = ({ gyroscopePosition, isLastPhoto, info }) => (
  <div className={classNames('allow-frame-tf', {
    'allow-frame-tf--warning': info,
    'allow-frame-tf--hidden': isLastPhoto,
  })}
  >
    <div className="allow-frame-tf__warning-content">

      <div className="allow-frame-tf__grade-wrap">
        <div className="allow-frame-tf__grade-container">
          {Math.round(gyroscopePosition * 180 / 360)}&deg;
        </div>
      </div>

      <p className="allow-frame-tf__warning-txt">
        Place your phone vertically on a table.
        <br />
        <br />
        Angle the phone so that the arrows
        <br />
        line up on the green.
      </p>
    </div>
  </div>
);

export default AllowFrameTF;
