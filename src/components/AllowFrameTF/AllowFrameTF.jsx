import { h } from 'preact';
import classNames from 'classnames';

import './AllowFrameTF.scss';

import SVGGradeTF from '../SVGComponents/SVGGradeTF';
import SVGPointerTF from '../SVGComponents/SVGPointerTF';

const AllowFrameTF = ({ gyroscopePosition, isLastPhoto, info }) => (
  <div className={classNames('allow-frame-tf', {
    'allow-frame-tf--warning': info,
    'allow-frame-tf--hidden': isLastPhoto,
  })}
  >
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
