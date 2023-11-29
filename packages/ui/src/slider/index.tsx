import './index.css';
import '../index.css';
import React from 'react';

type Props = {
  value: string;
  touched: boolean;
  min: number;
  max: number;
  step: number;
} 

export function Slider(min: number, max: number, step: number) {

  const [value, setValue] = React.useState(50)
  const [touched, setTouched] = React.useState(false)

  function handleChange() {

  }

  function doTouch() {
    setTouched(true)
  }

  function calcProgress(min: number, max: number, value: number) {
    const range = max - min
    const progInRange = value - min
    return ((progInRange*2)/range)-1
  }

  return (
    <div>
      <div className={`osc-slider`}>
        <div className="osc-slider-track-container">
          <div className="osc-slider-track"></div>
          <div className="osc-slider-track-progress-container">
            <div className="osc-slider-track-progress" style={{ transform: 'scaleX(' + calcProgress(min, max, value) + ')' }}></div>
          </div>
          <div className="osc-slider-track-dot-end osc-slider-track-dot-left"></div>
          <div className="osc-slider-track-dot-start osc-slider-track-dot-center"></div>
          <div className="osc-slider-track-dot-end osc-slider-track-dot-right"></div>
        </div>
        <input type='range' min={min} max={max} step={step} value={value} onClick={() => { if (!touched) doTouch(); } } onChange={handleChange} className={touched ? 'osc-slider-input-range' : 'osc-slider-input-range osc-slider-untouched'}/>
      </div>
    </div>
  );
  }
  