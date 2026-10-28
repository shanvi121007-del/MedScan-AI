import { createContext, useContext } from 'react';

export type Route =
  | 'home'
  | 'dashboard'
  | 'mri'
  | 'histopathology'
  | 'report'
  | 'history'
  | 'about'
  | 'auth';

interface RouterContextValue {
  route: Route;
  navigate: (route: Route) => void;
}

export const RouterContext = createContext<RouterContextValue>({
  route: 'home',
  navigate: () => {},
});

export function useRouter(): RouterContextValue {
  return useContext(RouterContext);
}
