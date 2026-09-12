import { forwardRef, useImperativeHandle } from 'react';

export interface AmbientBackgroundHandle {
  setProgress: (progress: number) => void;
  setScene: (id: string, direction?: 'forward' | 'backward') => void;
}

type AmbientBackgroundProps = {
  scene?: string;
};

export const AmbientBackground = forwardRef<AmbientBackgroundHandle, AmbientBackgroundProps>(
  function AmbientBackground(_props, _ref) {
    useImperativeHandle(_ref, () => ({
      setProgress: () => {},
      setScene: () => {},
    }));
    return <></>;
  },
);