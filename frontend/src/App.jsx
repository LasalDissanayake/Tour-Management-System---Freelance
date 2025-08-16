import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import MainAppRouter from './routes/MainAppRouter'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainAppRouter />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
