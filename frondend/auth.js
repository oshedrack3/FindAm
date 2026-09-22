function getSession() {
  try {
    return JSON.parse(
      localStorage.getItem("session")
    ) || null;
  } catch {
    return null;
  }
}
function getToken() {
  return getSession()?.token || null;
}
function getCurrentUser() {
  return getSession()?.user || null;
}
function isLoggedIn() {
  return !!getToken();
}
function saveSession(token, user) {
  localStorage.setItem(
    "session",
    JSON.stringify({
      token,
      user
    })
  );
}
function clearSession() {
  localStorage.removeItem(
    "session"
  );
}
async function verifySession() {
  const token = getToken();
  if (!token) {
    return false;
  }
  try {
    const res =
      await apiRequest(
        "/auth/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token
          })
        },
        false
      );
    if (!res) {
      return false;
    }
    const result =
      await res.json();
    if (
      !res.ok ||
      !result.success
    ) {
      clearSession();
      return false;
    }
    saveSession(
      token,
      result.user
    );
    return true;
  } catch (err) {
    console.error(
      "Session verification failed:",
      err
    );
    return false;
  }
}
async function login(
  loginValue,
  password
) {
  try {
    const res =
      await apiRequest(
        "/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            login: loginValue,
            password
          })
        },
        true
      );
    if (!res) {
      return null;
    }
    const result =
      await res.json();
    if (
      !res.ok ||
      !result.success
    ) {
      throw new Error(
        result.message ||
        "Login failed."
      );
    }
    saveSession(
      result.token,
      result.user
    );
    return result.user;
  } catch (err) {
    showAlert(
      err.message ||
      "Login failed."
    );
    return null;
  }
}
async function register(
  name,
  username,
  email,
  password
) {
  try {
    const res =
      await apiRequest(
        "/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            username,
            email,
            password
          })
        },
        true
      );
    if (!res) {
      return false;
    }
    const result =
      await res.json();
    if (
      !res.ok ||
      !result.success
    ) {
      throw new Error(
        result.message ||
        "Registration failed."
      );
    }
    showAlert(
      "Account created successfully."
    );
    return true;
  } catch (err) {
    showAlert(
      err.message ||
      "Registration failed."
    );
    return false;
  }
}
async function logout() {
  const token = getToken();
  try {
    if (token) {
      await apiRequest(
        "/auth/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token
          })
        },
        false
      );
    }
  } catch (err) {
    console.warn(
      "Logout request failed:",
      err
    );
  }
  clearSession();
  location.reload();
}

function createAuthPage() {
  const container =
    document.getElementById("app");
  if (!container) {
    return;
  }
  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-box">
        <div id="authContent"></div>
      </div>
    </div>
  `;
  showLogin();
}
function showLogin() {
  const content =
    document.getElementById("authContent");
  if (!content) {
    return;
  }
  content.innerHTML = `
    <div class="auth-header">
      <h1>FindAm</h1>
      <p>Find what you need.</p>
    </div>
    <form id="loginForm">
      <div class="form-group">
        <label for="loginInput">
          Username or email
        </label>
        <input
          id="loginInput"
          type="text"
          autocomplete="username"
          required
        >
      </div>
      <div class="form-group">
        <label for="loginPassword">
          Password
        </label>
        <input
          id="loginPassword"
          type="password"
          autocomplete="current-password"
          required
        >
      </div>
      <button type="submit">
        Login
      </button>
    </form>
    <p class="auth-switch">
      Don't have an account?
      <button
        type="button"
        id="showRegisterButton"
      >
        Create account
      </button>
    </p>
  `;
  document
    .getElementById("loginForm")
    .addEventListener(
      "submit",
      handleLogin
    );
  document
    .getElementById("showRegisterButton")
    .addEventListener(
      "click",
      showRegister
    );
}
function showRegister() {
  const content =
    document.getElementById("authContent");
  if (!content) {
    return;
  }
  content.innerHTML = `
    <div class="auth-header">
      <h1>Create account</h1>
      <p>Join FindAm.</p>
    </div>
    <form id="registerForm">
      <div class="form-group">
        <label for="registerName">
          Name
        </label>
        <input
          id="registerName"
          type="text"
          autocomplete="name"
          required
        >
      </div>
      <div class="form-group">
        <label for="registerUsername">
          Username
        </label>
        <input
          id="registerUsername"
          type="text"
          autocomplete="username"
          required
        >
      </div>
      <div class="form-group">
        <label for="registerEmail">
          Email
        </label>
        <input
          id="registerEmail"
          type="email"
          autocomplete="email"
          required
        >
      </div>
      <div class="form-group">
        <label for="registerPassword">
          Password
        </label>
        <input
          id="registerPassword"
          type="password"
          autocomplete="new-password"
          required
        >
      </div>
      <button type="submit">
        Create account
      </button>
    </form>
    <p class="auth-switch">
      Already have an account?
      <button
        type="button"
        id="showLoginButton"
      >
        Login
      </button>
    </p>
  `;
  document
    .getElementById("registerForm")
    .addEventListener(
      "submit",
      handleRegister
    );
  document
    .getElementById("showLoginButton")
    .addEventListener(
      "click",
      showLogin
    );
}
async function handleLogin(event) {
  event.preventDefault();
  const loginValue =
    document
      .getElementById("loginInput")
      .value
      .trim();
  const password =
    document
      .getElementById("loginPassword")
      .value;
  if (!loginValue || !password) {
    showAlert(
      "Please fill in all fields."
    );
    return;
  }
  const user =
    await login(
      loginValue,
      password
    );
  if (!user) {
    return;
  }
  location.reload();
}
async function handleRegister(event) {
  event.preventDefault();
  const name =
    document
      .getElementById("registerName")
      .value
      .trim();
  const username =
    document
      .getElementById("registerUsername")
      .value
      .trim();
  const email =
    document
      .getElementById("registerEmail")
      .value
      .trim();
  const password =
    document
      .getElementById("registerPassword")
      .value;
  if (
    !name ||
    !username ||
    !email ||
    !password
  ) {
    showAlert(
      "Please fill in all fields."
    );
    return;
  }
  const success =
    await register(
      name,
      username,
      email,
      password
    );
  if (!success) {
    return;
  }
  showLogin();
  const loginInput =
    document.getElementById(
      "loginInput"
    );
  if (loginInput) {
    loginInput.value =
      username;
  }
}


document.addEventListener(
  "DOMContentLoaded",
  async () => {
    if (isLoggedIn()) {
      await verifySession();
    }
    loadHome();
  }
);