"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ActiveCardContext = createContext<string | null>(null);
const SetActiveCardContext = createContext<((id: string | null) => void) | null>(null);
const ActiveStepContext = createContext<number>(-1);
const SetActiveStepContext = createContext<((idx: number) => void) | null>(null);

export function ActiveVideoProvider({ children }: { children: React.ReactNode }) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(-1);
  return (
    <SetActiveCardContext.Provider value={setActiveCardId}>
      <ActiveCardContext.Provider value={activeCardId}>
        <SetActiveStepContext.Provider value={setActiveStep}>
          <ActiveStepContext.Provider value={activeStep}>
            {children}
          </ActiveStepContext.Provider>
        </SetActiveStepContext.Provider>
      </ActiveCardContext.Provider>
    </SetActiveCardContext.Provider>
  );
}

export function useActiveCardId(): string | null {
  return useContext(ActiveCardContext);
}

export function useSetActiveCardId(): (id: string | null) => void {
  const setter = useContext(SetActiveCardContext);
  const noop = useCallback(() => {}, []);
  return setter ?? noop;
}

export function useActiveStep(): number {
  return useContext(ActiveStepContext);
}

export function useSetActiveStep(): (idx: number) => void {
  const setter = useContext(SetActiveStepContext);
  const noop = useCallback(() => {}, []);
  return setter ?? noop;
}
