import { useState, createContext, useContext, useMemo } from 'react';
import { Step } from 'react-joyride';

interface JoyrideStepProps {
  run: boolean;
  stepIndex: number;
  steps: Step[];
  tourActive: boolean;
}

const joyrideStepState = {
  run: false,
  stepIndex: 0,
  steps: [],
  tourActive: false,
};

export const JoyrideStepContext = createContext({
  state: joyrideStepState,
  setState: () => undefined,
});
JoyrideStepContext.displayName = 'JoyrideStepContext';

export function JoyrideStepProvider(props: any) {
  const [state, setState] = useState(joyrideStepState);

  const value = useMemo(
    () => ({
      state,
      setState,
    }),
    [setState, state],
  );

  return <JoyrideStepContext.Provider value={value} {...props} />;
}

export function useJoyrideStepContext(): {
  setState: (patch: Partial<JoyrideStepProps> | ((previousState: JoyrideStepProps) => Partial<JoyrideStepProps>)) => void;
  state: JoyrideStepProps;
} {
  const context = useContext(JoyrideStepContext);
  if (!context) {
    throw new Error('useJoyrideStepContext must be used within a JoyrideStepProvider');
  }
  return context;
}
