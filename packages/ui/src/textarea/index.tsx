import '../index.css';
import './index.css';
import React, { forwardRef } from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  errors?: string;
  info?: string;
  label?: string;
};

const Textarea = forwardRef<HTMLInputElement, Props>((props, ref) => {
  return (
    <>
      {props.label ? <p className="input-label">{props.label}</p> : null}
      <textarea
        className={`${props.errors ? 'alert' : null} ${props.className}`}
      />

      {props.errors ? (
        <>
          <p className={`helptext error`}>
            <i className="ri-alert-fill" />
            {props.errors}
          </p>
        </>
      ) : null}
      {props.info && !props.errors ? (
        <p className={`helptext`}>
          <i className="ri-error-warning-fill" />
          {props.info}
        </p>
      ) : null}
    </>
  );
});

export { Textarea };
