import React from 'react';

// Inspiration - https://goo.gl/rSJxha
const Close = props => {
  const { size, color, ...rest} = props;
  const boxSize = {
    width: size || '1rem',
    height: size || '1rem',
    cursor: 'pointer',
    boxSizing: 'content-box' // Forces padding on the outside.
  };
  const xStyle = {
    stroke: color || 'black',
    fill: 'transparent',
    strokeLinecap: 'round',
    strokeWidth: 5
  };

  return (
    <div style={boxSize} {...rest}>
      <svg viewBox='0 0 30 30'>
        <path style={xStyle} d='M 3,3 L 27,27 M 27,3 L 3,27' />
      </svg>
    </div>
  );
};

export default Close;
