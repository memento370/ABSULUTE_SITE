import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'about', renderMode: RenderMode.Server },
  { path: 'files', renderMode: RenderMode.Server },
  { path: 'register', renderMode: RenderMode.Server },

  // browser-only сторінка
  { path: 'cabinet', renderMode: RenderMode.Client },

  { path: '**', renderMode: RenderMode.Server },
];