import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ReactNative = require('react-native');

const lockFontScaling = (name: 'Text' | 'TextInput'): void => {
  const Original: any = ReactNative[name];
  const Locked: any = React.forwardRef<any, any>((props, ref) =>
    React.createElement(Original, { ...props, ref, allowFontScaling: false }),
  );
  Locked.displayName = name;
  Object.defineProperty(ReactNative, name, {
    configurable: true,
    enumerable: true,
    get: () => Locked,
  });
};

lockFontScaling('Text');
lockFontScaling('TextInput');
