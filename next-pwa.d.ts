declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    sw?: string;
    swSrc?: string;
    fallbacks?: {
      document?: string;
      image?: string;
      font?: string;
      audio?: string;
      video?: string;
    };
    buildExcludes?: RegExp[];
    publicExcludes?: string[];
    scope?: string;
    base?: string;
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    swMinify?: boolean;
    workboxOptions?: any;
  }
  
  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  export default withPWA;
}

