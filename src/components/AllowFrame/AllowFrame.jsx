// eslint-disable-next-line no-unused-vars
import { Fragment, h } from 'preact';
import classNames from 'classnames';

import SVGGrade from '../SVGComponents/SVGGrade';
import SVGPointer from '../SVGComponents/SVGPointer';
import SVGWarning from '../SVGComponents/SVGWarning';

import './AllowFrame.scss';
import SVGFrameFront from '../SVGComponents/SVGFrameFront';
import SVGFrameSide from '../SVGComponents/SVGFrameSide';

const AllowFrame = ({
  gyroscopePosition,
  isLastPhoto,
  info,
  type = 'front',
}) => (
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
      {!info && (type === 'front' ? <SVGFrameFront className="allow-frame__silhouette" /> : <SVGFrameSide className="allow-frame__silhouette" />)}
      <div className="allow-frame__warning-content">
        <SVGWarning className="allow-frame__warning-img" />
        <h2 className="allow-frame__warning-txt">
          Hold your phone vertically and line up the green arrows
        </h2>
      </div>
    </div>
  </Fragment>
);

export default AllowFrame;
