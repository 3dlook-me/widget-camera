import { Fragment, h } from 'preact';
import classNames from 'classnames';

import './AllowFrameTF.scss';

import grade from '../../images/grade-tf.svg';
import pointer from '../../images/arrows-tf.svg';

const AllowFrameTF = ({ gyroscopePosition, isLastPhoto, info }) => (
  <Fragment>
    <div className={classNames('allow-frame-tf', {
      'allow-frame-tf--warning': info,
      'allow-frame-tf--hidden': isLastPhoto,
    })}
    >
      <div className="allow-frame-tf__warning-content">

        <div className="allow-frame-tf__grade-wrap">
          <div className="allow-frame-tf__grade-container">
            <img className="allow-frame-tf__grade" src={grade} alt="grade" />
            <div className="allow-frame-tf__pointer" style={{ transform: `translateY(-${gyroscopePosition}px)` }}>
              <img className="allow-frame-tf__pointer-icon" src={pointer} alt="pointer" />
            </div>
          </div>
        </div>

        <p className="allow-frame-tf__warning-txt">
          Hold your phone vertically on a table
          <br />
          <br />
          Angle the phone so that the arrows
          <br />
          line up on the green.
        </p>
      </div>
    </div>
  </Fragment>
);

export default AllowFrameTF;
