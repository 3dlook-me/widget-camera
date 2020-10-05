import { Fragment, h } from 'preact';
import classNames from 'classnames';

import './AllowFrame.scss';

/* import grade from '../../images/grade.svg';
import pointer from '../../images/pointer.svg';
import warning from '../../images/camera-warning.svg'; */

const AllowFrame = ({ gyroscopePosition, isLastPhoto, info }) => (
  <Fragment>
    <div className="widget-camera__grade-wrap">
      <div className="widget-camera__grade-container">
        {Math.round(gyroscopePosition * 180 / 360)}&deg;
      </div>
    </div>

    <div className={classNames('allow-frame', {
      'allow-frame--warning': info,
      'allow-frame--hidden': isLastPhoto,
    })}
    >
      {/* <div className="allow-frame__warning-content">
        <img className="allow-frame__warning-img" src={warning} alt="warning" />
        <h2 className="allow-frame__warning-txt">
          Hold your phone vertically and line up the green arrows
        </h2>
      </div> */}

      <div className="allow-frame__bottom-border">
        <div className="allow-frame__bottom-border-space" />
      </div>
    </div>
  </Fragment>
);

export default AllowFrame;
