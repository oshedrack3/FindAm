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
  const authPage = document.querySelector(".auth-page");
  
  if (!authPage) {
    return;
  }
  
  showLogin();
}


function showLogin() {
  const loginContent =
    document.getElementById("loginContent");
  
  const registerContent =
    document.getElementById("registerContent");
  
  if (!loginContent || !registerContent) {
    return;
  }
  
  loginContent.hidden = false;
  registerContent.hidden = true;
}


function showRegister() {
  const loginContent =
    document.getElementById("loginContent");
  
  const registerContent =
    document.getElementById("registerContent");
  
  if (!loginContent || !registerContent) {
    return;
  }
  
  loginContent.hidden = true;
  registerContent.hidden = false;
}


async function handleLogin(event) {
  event.preventDefault();
  
  const loginValue =
    document.getElementById("loginInput").value.trim();
  
  const password =
    document.getElementById("loginPassword").value;
  
  if (!loginValue || !password) {
    showAlert("Please fill in all fields.");
    return;
  }
  
  const user = await login(
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
    document.getElementById("registerName").value.trim();
  
  const username =
    document.getElementById("registerUsername").value.trim();
  
  const email =
    document.getElementById("registerEmail").value.trim();
  
  const password =
    document.getElementById("registerPassword").value;
  
  if (!name || !username || !email || !password) {
    showAlert("Please fill in all fields.");
    return;
  }
  
  const success = await register(
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
    document.getElementById("loginInput");
  
  if (loginInput) {
    loginInput.value = username;
  }
}


function handleAuth() {
  createAuthPage();
}


document
  .getElementById("loginForm")
  ?.addEventListener("submit", handleLogin);

document
  .getElementById("registerForm")
  ?.addEventListener("submit", handleRegister);

document
  .getElementById("showRegisterButton")
  ?.addEventListener("click", showRegister);

document
  .getElementById("showLoginButton")
  ?.addEventListener("click", showLogin);




document.addEventListener(
  "DOMContentLoaded",
  async () => {
    if (isLoggedIn()) {
      await verifySession();
    }
    loadHome();
  }
);