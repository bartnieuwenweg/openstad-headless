import '../index.css';
import './index.css';
import React, { forwardRef } from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  errors?: string;
  info?: string;
  label?: string;
};

const Slider = forwardRef<HTMLInputElement, Props>((props, ref) => {
  const min = 0;
  const max = 100;
  const [value, setValue] = React.useState(50);

  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    setValue(Number(e.currentTarget.value));
  }

  function calcProgress(min: number, max: number, value: number) {
    const range = max - min;
    const progInRange = value - min;
    return ((progInRange*2)/range)-1;
  }

  return (
    <div className={`osc-slider`}>
      <div className="osc-slider-track-container">
        <div className="osc-slider-track"></div>
        <div className="osc-slider-track-progress-container">
          <div className="osc-slider-track-progress" style={{ transform: 'scaleX(' + calcProgress(min, max, value) + ')' }}></div>
        </div>
        <div className="osc-slider-track-dot-start osc-slider-track-dot-center"></div>
      </div>
      <input type='range' min={min} max={max} step={1} defaultValue={value} onChange={onChange} className={'osc-slider-input-range'}/>
    </div>
  );
});

export { Slider };
  