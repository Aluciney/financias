import { createBrowserRouter } from 'react-router'
import { AppLayout } from '../layouts/AppLayout'
import { Dashboard } from '../pages/Dashboard'
import { Rendimentos } from '../pages/Rendimentos'
import { Simulador } from '../pages/Simulador'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'rendimentos', Component: Rendimentos },
      { path: 'simulador', Component: Simulador },
    ],
  },
])
