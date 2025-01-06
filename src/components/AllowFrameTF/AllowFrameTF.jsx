// eslint-disable-next-line no-unused-vars
import { h } from 'preact';
import classNames from 'classnames';

import './AllowFrameTF.scss';

import SVGGradeTF from '../SVGComponents/SVGGradeTF';
import SVGPointerTF from '../SVGComponents/SVGPointerTF';
import SVGFrameFront from '../SVGComponents/SVGFrameFront';
import SVGFrameSide from '../SVGComponents/SVGFrameSide';

const AllowFrameTF = ({
  gyroscopePosition,
  isLastPhoto,
  info,
  type = 'front',
}) => (
  <div className={classNames('allow-frame-tf', {
    'allow-frame-tf--warning': info,
    'allow-frame-tf--hidden': isLastPhoto,
  })}
  >
    {type === 'front' ? <SVGFrameFront className="allow-frame-tf__silhouette" /> : <SVGFrameSide className="allow-frame-tf__silhouette" />}
    <div className="allow-frame-tf__warning-content">

      <div className="allow-frame-tf__grade-wrap">
        <div className="allow-frame-tf__grade-container">
          <SVGGradeTF className="allow-frame-tf__grade" />
          <div className="allow-frame-tf__pointer" style={{ transform: `translateY(-${gyroscopePosition}px)` }}>
            <SVGPointerTF className="allow-frame-tf__pointer-icon" />
          </div>
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
