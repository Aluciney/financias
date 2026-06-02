import { RouterProvider } from 'react-router'
import { router } from './routes'

export const App: React.FC = () => {
  return <RouterProvider router={router} />
}
