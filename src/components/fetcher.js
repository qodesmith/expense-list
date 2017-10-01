function fetcher(method, url, body) {
  const config = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (method !== 'GET') config.body = JSON.stringify(body);

  return fetch(url, config)
    .then(res => res.json())
    .catch(err => err);
}

/* C */ export const post = (url, body) => fetcher('POST', url, body);
/* R */ export const get = url => fetcher('GET', url);
/* U */ export const put = (url, body) => fetcher('PUT', url, body);
/* D */ export const del = (url) => fetcher('DELETE', url);

export default { get, post, put, del };
