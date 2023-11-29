import '../index.css';
import './index.css';
import React, { forwardRef } from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  errors?: string;
  info?: string;
  label?: string;
};

const Slider = forwardRef<HTMLInputElement, Props>((props, ref) => {
  return (
    <div>
      <div className={`osc-slider`}>
        <input type='range' min={0} max={100} step={1} className='osc-slider-input-range'/>
      </div>
    </div>
  );
});

export { Slider };
  