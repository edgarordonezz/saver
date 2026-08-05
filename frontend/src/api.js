/*
Grab saved JWT straight from browser storage
Builds request config passed to fetch 
The ...options spread copies over anything the caller passed in
If Dashboard calls authFetch(url, {method: "POST", body: JSON.stringify(data)})
    method and body get merged in here automatically
 */
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  return res;
}