import { Fragment, h } from 'preact';
import classNames from 'classnames';

import './AllowFrame.scss';

import grade from '../../images/grade-tf.svg';
import pointer from '../../images/arrows-tf.svg';
import warning from '../../images/camera-warning.svg';

const AllowFrame = ({ gyroscopePosition, isLastPhoto, info }) => (
  <Fragment>
    <div className="widget-camera__grade-wrap">
      <div className="widget-camera__grade-container">
        <img className="widget-camera__grade" src={grade} alt="grade" />
        <div className="widget-camera__pointer" style={{ transform: `translateY(-${gyroscopePosition}px)` }}>
          <img className="widget-camera__pointer-icon" src={pointer} alt="pointer" />
        </div>
      </div>
    </div>

    <div className={classNames('allow-frame', {
      'allow-frame--warning': info,
      'allow-frame--hidden': isLastPhoto,
    })}
    >
      <div className="allow-frame__warning-content">
        <img className="allow-frame__warning-img" src={warning} alt="warning" />
        <h2 className="allow-frame__warning-txt">
          Hold your phone vertically and line up the green arrows
        </h2>
      </div>

      <div className="allow-frame__bottom-border">
        <div className="allow-frame__bottom-border-space" />
      </div>
    </div>
  </Fragment>
);

export default AllowFrame;
