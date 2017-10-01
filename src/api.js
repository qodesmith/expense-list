// Used with a GraphQL api.
function api(method, query) {
  return fetch('/some/api/endpoint', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
    .then(res => res.json())
    .catch(err => handleError(err));
}

export default api;
