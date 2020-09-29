import { Fragment, h } from 'preact';
import classNames from 'classnames';

import SVGGrade from '../SVGComponents/SVGGrade';
import SVGPointer from '../SVGComponents/SVGPointer';
import SVGWarning from '../SVGComponents/SVGWarning';

import './AllowFrame.scss';

const AllowFrame = ({ gyroscopePosition, isLastPhoto, info }) => (
  <Fragment>
    <div className="widget-camera__grade-wrap">
      <div className="widget-camera__grade-container">
        <SVGGrade className="widget-camera__grade" />
        <div className="widget-camera__pointer" style={{ transform: `translateY(-${gyroscopePosition}px)` }}>
          <SVGPointer className="widget-camera__pointer-icon" />
        </div>
      </div>
    </div>

    <div className={classNames('allow-frame', {
      'allow-frame--warning': info,
      'allow-frame--hidden': isLastPhoto,
    })}
    >
      <div className="allow-frame__warning-content">
        <SVGWarning className="allow-frame__warning-img" />
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
