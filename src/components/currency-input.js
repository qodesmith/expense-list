import React, { Component } from 'react';

// Convenient helper function that can be imported wherever
// `CurrencyInput` is used. Should be used in a parent component's
// `submit` function to ensure proper currency formatting.
export const sanitizeAmount = amount => {
  if (typeof amount === 'number') return amount;
  const arr = amount.split('.');

  if (arr.length > 1) {
    if (!arr[0].length) arr[0] = '0';       // '.25' => ['', '25'] => ['0', '25']
    if (arr[1].length === 1) arr[1] += '0'; // '5.5' => ['5', '5'] => ['5', '50']
    if (!arr[1].length) arr[1] = '00';      // '5.'  => ['5', '']  => ['5', '00']
  } else if (arr.length === 1) {
    arr[1] = '00';                          // '5'   => ['5']      => ['5', '00']
  }

  amount = arr.join('.');

  // Avoid submitting values of 0.
  const zeros = amount.split('').every(char => char === '0' || char === '.');
  return zeros ? null : amount;
}

class CurrencyInput extends Component {
  constructor(props) {
    super(props);
    this.state = { value: props.initialValue || '' };
    this.onChange = this.onChange.bind(this);

    // Avoid React's 'unknown props' warning for the `initialValue` property.
    this.properties = { ...props };
    delete this.properties.initialValue;
  }

  onChange(e) {
    let value = e.target.value.replace(/[^0-9.]/g, '');
    const arr = value.split('.');

    // Ignore invalid values (especially if pasted in).
    if (
      arr.length > 2 ||
      (arr.length === 2 && arr[1].length > 2)
    ) return;

    // Avoid duplicate leading 0's.
    arr[0] = this.removeLeadingZeros(arr[0]);

    value = arr.length > 1 ? arr.join('.') : arr[0];

    // If provided with a parent onChange,
    // call it after updating state.
    e.persist(); // https://goo.gl/5ScdzU
    this.setState({ value }, () => {
      this.props.onChange && this.props.onChange(e);
    });
  }

  removeLeadingZeros(val) {
    if (val.length === 1) return val;

    let loop = true;
    while(loop) {
      if (val[0] === '0' && val[1] && val[1] !== '.') {
        val = val.slice(1);
      } else {
        loop = false;
      }
    }

    return val;
  }

  render() {
    return (
      <input
        {...this.properties}
        type="text"
        onChange={this.onChange}
        value={this.state.value} />
    );
  }
}

export default CurrencyInput;
