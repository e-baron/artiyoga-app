import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('appInfo', {
  name: 'ArtiYoga Desktop',
  version: '0.1.0'
});

declare global {
  interface Window {
    appInfo: {
      name: string;
      version: string;
    };
  }
}