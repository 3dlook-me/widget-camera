import { Component, h } from 'preact';

class SVGGrade extends Component {
  render() {
    const { className } = this.props;

    return (
      <svg className={className} width="40px" height="380px" viewBox="0 0 40 380" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <title>grade</title>
        <desc>Created with Sketch.</desc>
        <defs>
          <filter x="-57.5%" y="-6.4%" width="215.0%" height="112.8%" filterUnits="objectBoundingBox" id="filter-1">
            <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
            <feMerge>
              <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
              <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
          </filter>
          <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-2">
            <stop stop-color="#D13434" offset="0%"></stop>
            <stop stop-color="#EA621E" offset="58.659734%"></stop>
            <stop stop-color="#E0D889" offset="84.905511%"></stop>
            <stop stop-color="#33CF7C" offset="100%"></stop>
          </linearGradient>
        </defs>
        <g id="Mobile" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" opacity="0.8">
          <g id="[M]-Step-6_2" transform="translate(-7.000000, -126.000000)">
            <g id="Group-5" filter="url(#filter-1)" transform="translate(7.000000, 134.000000)">
              <g id="grade" transform="translate(10.000000, 0.000000)">
                <path d="M4,0 L16,0 C18.209139,-4.05812251e-16 20,1.790861 20,4 L20,180 L20,180 L0,180 L0,4 C-2.705415e-16,1.790861 1.790861,4.05812251e-16 4,0 Z" id="Rectangle" fill="url(#linearGradient-2)"></path>
                <path d="M4,180 L16,180 C18.209139,180 20,181.790861 20,184 L20,360 L20,360 L0,360 L0,184 C-2.705415e-16,181.790861 1.790861,180 4,180 Z" id="Rectangle-Copy-2" fill="url(#linearGradient-2)" transform="translate(10.000000, 270.000000) scale(1, -1) translate(-10.000000, -270.000000) "></path>
                <g id="Group-6" transform="translate(3.000000, 14.000000)" fill="#FFFFFF">
                  <rect id="Rectangle-Copy-3" x="4" y="0" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-4" x="4" y="11" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-5" x="4" y="22" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-6" x="0" y="33" width="14" height="1"></rect>
                  <rect id="Rectangle-Copy-7" x="4" y="44" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-8" x="4" y="55" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-9" x="4" y="66" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-10" x="0" y="77" width="14" height="1"></rect>
                  <rect id="Rectangle-Copy-7" x="4" y="88" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-8" x="4" y="99" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-9" x="4" y="110" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-10" x="0" y="121" width="14" height="1"></rect>
                  <rect id="Rectangle-Copy-7" x="4" y="132" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-8" x="4" y="143" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-9" x="4" y="154" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-10" x="0" y="165" width="14" height="1"></rect>
                  <rect id="Rectangle-Copy-7" x="4" y="176" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-8" x="4" y="187" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-9" x="4" y="198" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-10" x="0" y="209" width="14" height="1"></rect>
                  <rect id="Rectangle-Copy-7" x="4" y="220" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-8" x="4" y="231" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-9" x="4" y="242" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-10" x="0" y="253" width="14" height="1"></rect>
                  <rect id="Rectangle-Copy-7" x="4" y="264" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-8" x="4" y="275" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-9" x="4" y="286" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-10" x="0" y="297" width="14" height="1"></rect>
                  <rect id="Rectangle-Copy-7" x="4" y="308" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-8" x="4" y="319" width="6" height="1"></rect>
                  <rect id="Rectangle-Copy-9" x="4" y="330" width="6" height="1"></rect>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    );
  }
}

export default SVGGrade;
