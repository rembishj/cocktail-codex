const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export const api = {
  // Recipes
  getRecipes: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString()
    return request(`/recipes${qs ? '?' + qs : ''}`)
  },
  getRecipe: (id) => request(`/recipes/${id}`),
  createRecipe: (data) => request('/recipes', { method: 'POST', body: data }),
  updateRecipe: (id, data) => request(`/recipes/${id}`, { method: 'PUT', body: data }),
  deleteRecipe: (id) => request(`/recipes/${id}`, { method: 'DELETE' }),

  // Ingredients
  getIngredients: (search = '') => request(`/ingredients${search ? '?search=' + encodeURIComponent(search) : ''}`),
  createIngredient: (data) => request('/ingredients', { method: 'POST', body: data }),

  // Cabinet
  getCabinet: () => request('/cabinet'),
  updateCabinet: (ingredientId, data) => request(`/cabinet/${ingredientId}`, { method: 'PUT', body: data }),
}
