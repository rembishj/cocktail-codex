import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import RecipesPage from './pages/RecipesPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import AddRecipePage from './pages/AddRecipePage'
import CabinetPage from './pages/CabinetPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
        <Routes>
          <Route path="/" element={<RecipesPage />} />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="/add" element={<AddRecipePage />} />
          <Route path="/recipe/:id/edit" element={<AddRecipePage />} />
          <Route path="/cabinet" element={<CabinetPage />} />
        </Routes>
        <Nav />
      </div>
    </BrowserRouter>
  )
}
