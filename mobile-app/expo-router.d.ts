// Expo Router type declarations for custom routes

import type {
  RelativePathString,
  ExternalPathString,
  AbsolutePathString,
} from 'expo-router';

declare module 'expo-router' {
  export type Route =
    | '/'
    | '/(tabs)'
    | '/(tabs)/index'
    | '/(tabs)/history'
    | '/(tabs)/settings'
    | '/auth'
    | '/camera'
    | '/crop'
    | '/preview'
    | '/result'
    | '/modal'
    | '/disclaimer'
    | '/anomaly-detail'
    | '/profile';

  export type RelativePathString =
    | `/${string}`
    | `./${string}`
    | `../${string}`
    | './'
    | '../'
    | '.';

  export type AbsolutePathString = `/${string}`;

  export type ExternalPathString =
    | `https://${string}`
    | `http://${string}`
    | `mailto:${string}`
    | `tel:${string}`;
}

// Type-safe router push/replace
declare module 'expo-router' {
  interface Router {
    push(route: Route): void;
    replace(route: Route): void;
    setParams(params?: object): void;
    back(): void;
    dismiss(): void;
    dismissAll(): void;
    canGoBack(): boolean;
  }
}
