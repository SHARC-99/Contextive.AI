import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./home/home/home").then((m) => m.HomeComponent),
  },
  {
    path: "upload",
    loadComponent: () => import("./upload/upload/upload").then((m) => m.UploadComponent),
  },
  {
    path: "history",
    loadComponent: () => import("./history/history/history").then((m) => m.HistoryComponent),
  },
  {
    path: "**",
    redirectTo: "",
  },
]