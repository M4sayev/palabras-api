const API_BASE = "http://localhost:3000/api/v1";

let accessToken = null;

async function register(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }

  accessToken = data.accessToken;
  return data.user;
}

async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  accessToken = data.accessToken;
  return data.user;
}

async function refreshAccessToken() {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    accessToken = null;
    throw new Error("Session expired, please log in again");
  }

  const data = await res.json();
  accessToken = data.accessToken;
  return accessToken;
}

async function apiFetch(url, options = {}) {
  const doFetch = (token) =>
    fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  let res = await doFetch(accessToken);

  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      res = await doFetch(newToken);
    } catch {
      window.location.href = "/login.html";
      return;
    }
  }

  return res;
}

async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout request failed", err);
  } finally {
    accessToken = null;
    window.location.href = "/login.html";
  }
}

async function deleteAccount() {
  try {
    const res = await apiFetch(`${API_BASE}/auth/account`, {
      method: "DELETE",
    });

    if (!res.ok) {
      console.error("Failed to delete account");
      return false;
    }

    accessToken = null;
    window.location.href = "/login.html";
    return true;
  } catch (err) {
    console.error("Delete account request failed", err);
    return false;
  }
}

export { apiFetch, register, login, refreshAccessToken, logout, deleteAccount };
