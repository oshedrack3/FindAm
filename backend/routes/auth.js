import { v4 as uuid } from "uuid";
export async function handleAuthRequest(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  if (request.method === "POST" && pathname === "/auth/register") {
    return await register(request, env);
  }
  if (request.method === "POST" && pathname === "/auth/login") {
    return await login(request, env);
  }
  if (request.method === "POST" && pathname === "/auth/logout") {
    return await logout(request, env);
  }
  if (request.method === "POST" && pathname === "/auth/verify") {
    return await verify(request, env);
  }
  return Response.json(
    {
      success: false,
      message: "Auth route not found."
    },
    { status: 404 }
  );
}
async function register(request, env) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const username = String(
      body.username || ""
    ).trim();
    const email = String(
      body.email || ""
    ).trim().toLowerCase();
    const password = String(
      body.password || ""
    );
    if (!name || !username || !email || !password) {
      return Response.json(
        {
          success: false,
          message:
            "Name, username, email and password are required."
        },
        { status: 400 }
      );
    }
    if (!isValidUsername(username)) {
      return Response.json(
        {
          success: false,
          message:
            "Username must be 3-30 characters and may only contain letters, numbers, underscores and hyphens."
        },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return Response.json(
        {
          success: false,
          message:
            "Please provide a valid email address."
        },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return Response.json(
        {
          success: false,
          message:
            "Password must be at least 6 characters."
        },
        { status: 400 }
      );
    }
    const id = uuid();
    const now = Date.now();
    const passwordHash =
      await hashPassword(password);
    try {
      await env.DB
        .prepare(`
          INSERT INTO users (
            id,
            name,
            username,
            email,
            password_hash,
            role,
            status,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          id,
          name,
          username,
          email,
          passwordHash,
          "user",
          "active",
          now,
          now
        )
        .run();
    } catch (error) {
      const message = String(
        error?.message || ""
      ).toLowerCase();
      console.error(
        "Registration database error:",
        error
      );
      if (
        message.includes("unique constraint") &&
        message.includes("users.username")
      ) {
        return Response.json(
          {
            success: false,
            message:
              "Username already exists."
          },
          { status: 409 }
        );
      }
      if (
        message.includes("unique constraint") &&
        message.includes("users.email")
      ) {
        return Response.json(
          {
            success: false,
            message:
              "Email already exists."
          },
          { status: 409 }
        );
      }
      return Response.json(
        {
          success: false,
          message:
            "Unable to create account. Please try again."
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message:
          "Account created successfully.",
        user: {
          id,
          name,
          username,
          email,
          role: "user",
          status: "active",
          created_at: now,
          updated_at: now
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );
    return Response.json(
      {
        success: false,
        message:
          "Registration failed. Please try again."
      },
      { status: 500 }
    );
  }
}
async function login(request, env) {
  try {
    const body = await request.json();
    const loginValue = String(
      body.login || ""
    ).trim().toLowerCase();
    const password = String(
      body.password || ""
    );
    if (!loginValue || !password) {
      return Response.json(
        {
          success: false,
          message:
            "Login and password are required."
        },
        { status: 400 }
      );
    }
    const user = await env.DB
      .prepare(`
        SELECT
          id,
          name,
          username,
          email,
          password_hash,
          role,
          status,
          created_at,
          updated_at
        FROM users
        WHERE LOWER(username) = ?
           OR LOWER(email) = ?
        LIMIT 1
      `)
      .bind(
        loginValue,
        loginValue
      )
      .first();
    if (!user) {
      return Response.json(
        {
          success: false,
          title:
            "Account Not Found",
          message:
            "No account exists with these login details."
        },
        { status: 404 }
      );
    }
    if (user.status !== "active") {
      return Response.json(
        {
          success: false,
          title:
            "Account Inactive",
          message:
            "This account is currently inactive."
        },
        { status: 403 }
      );
    }
    const validPassword =
      await verifyPassword(
        password,
        user.password_hash
      );
    if (!validPassword) {
      return Response.json(
        {
          success: false,
          title:
            "Invalid Password",
          message:
            "The password is incorrect. Please check and try again."
        },
        { status: 401 }
      );
    }
    await env.DB
      .prepare(`
        DELETE FROM sessions
        WHERE user_id = ?
      `)
      .bind(user.id)
      .run();
    const token = uuid();
    const now = Date.now();
    const expiresAt =
      now +
      30 *
        24 *
        60 *
        60 *
        1000;
    await env.DB
      .prepare(`
        INSERT INTO sessions (
          token,
          user_id,
          created_at,
          expires_at,
          active
        )
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(
        token,
        user.id,
        now,
        expiresAt,
        1
      )
      .run();
    return Response.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );
    return Response.json(
      {
        success: false,
        message:
          error.message ||
          "Login failed."
      },
      { status: 500 }
    );
  }
}
async function logout(request, env) {
  try {
    const body = await request.json();
    const token = String(
      body.token || ""
    ).trim();
    if (!token) {
      return Response.json(
        {
          success: false,
          message:
            "Token is required."
        },
        { status: 400 }
      );
    }
    await env.DB
      .prepare(`
        DELETE FROM sessions
        WHERE token = ?
      `)
      .bind(token)
      .run();
    return Response.json({
      success: true,
      message:
        "Logged out successfully."
    });
  } catch (error) {
    console.error(
      "Logout error:",
      error
    );
    return Response.json(
      {
        success: false,
        message:
          error.message ||
          "Logout failed."
      },
      { status: 500 }
    );
  }
}
async function verify(request, env) {
  try {
    const body = await request.json();
    const token = String(
      body.token || ""
    ).trim();
    if (!token) {
      return Response.json(
        {
          success: false,
          message:
            "Token is required."
        },
        { status: 400 }
      );
    }
    const session = await env.DB
      .prepare(`
        SELECT
          s.token,
          s.user_id,
          s.created_at AS session_created_at,
          s.expires_at,
          s.active,
          u.id,
          u.name,
          u.username,
          u.email,
          u.role,
          u.status,
          u.created_at,
          u.updated_at
        FROM sessions s
        INNER JOIN users u
          ON u.id = s.user_id
        WHERE s.token = ?
        LIMIT 1
      `)
      .bind(token)
      .first();
    if (!session) {
      return Response.json(
        {
          success: false,
          message:
            "Invalid session."
        },
        { status: 401 }
      );
    }
    if (!Number(session.active)) {
      return Response.json(
        {
          success: false,
          message:
            "Session inactive."
        },
        { status: 401 }
      );
    }
    if (session.status !== "active") {
      return Response.json(
        {
          success: false,
          message:
            "Account inactive."
        },
        { status: 403 }
      );
    }
    if (
      Date.now() >
      Number(session.expires_at)
    ) {
      await env.DB
        .prepare(`
          DELETE FROM sessions
          WHERE token = ?
        `)
        .bind(token)
        .run();
      return Response.json(
        {
          success: false,
          message:
            "Session expired."
        },
        { status: 401 }
      );
    }
    return Response.json({
      success: true,
      user: {
        id: session.id,
        name: session.name,
        username:
          session.username,
        email: session.email,
        role: session.role,
        status: session.status,
        created_at:
          session.created_at,
        updated_at:
          session.updated_at
      }
    });
  } catch (error) {
    console.error(
      "Verify error:",
      error
    );
    return Response.json(
      {
        success: false,
        message:
          error.message ||
          "Session verification failed."
      },
      { status: 500 }
    );
  }
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]{2,29}$/.test(
    username
  );
}

function isValidEmail(email) {
  if (
    email.length < 5 ||
    email.length > 254
  ) {
    return false;
  }
  if (
    /\s/.test(email)
  ) {
    return false;
  }
  const parts = email.split("@");
  if (parts.length !== 2) {
    return false;
  }
  const [local, domain] = parts;
  if (
    !local ||
    !domain ||
    local.length > 64
  ) {
    return false;
  }
  if (
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..")
  ) {
    return false;
  }
  if (
    !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(
      local
    )
  ) {
    return false;
  }
  if (
    domain.length > 253 ||
    domain.startsWith(".") ||
    domain.endsWith(".") ||
    domain.includes("..")
  ) {
    return false;
  }
  const labels =
    domain.split(".");
  if (labels.length < 2) {
    return false;
  }
  for (const label of labels) {
    if (
      !label ||
      label.length > 63 ||
      label.startsWith("-") ||
      label.endsWith("-") ||
      !/^[a-zA-Z0-9-]+$/.test(
        label
      )
    ) {
      return false;
    }
  }
  const tld =
    labels[labels.length - 1];
  if (
    !/^[a-zA-Z]{2,63}$/.test(tld)
  ) {
    return false;
  }
  return true;
}
async function hashPassword(password) {
  const encoder =
    new TextEncoder();
  const salt =
    crypto.getRandomValues(
      new Uint8Array(16)
    );
  const key =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      {
        name: "PBKDF2"
      },
      false,
      ["deriveBits"]
    );
  const bits =
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      key,
      256
    );
  return (
    arrayBufferToBase64(salt) +
    "." +
    arrayBufferToBase64(bits)
  );
}
async function verifyPassword(
  password,
  storedHash
) {
  if (
    !storedHash ||
    !storedHash.includes(".")
  ) {
    return false;
  }
  const parts =
    storedHash.split(".");
  if (parts.length !== 2) {
    return false;
  }
  const salt =
    base64ToUint8Array(
      parts[0]
    );
  const expectedHash =
    parts[1];
  const encoder =
    new TextEncoder();
  const key =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      {
        name: "PBKDF2"
      },
      false,
      ["deriveBits"]
    );
  const bits =
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      key,
      256
    );
  const actualHash =
    arrayBufferToBase64(bits);
  return (
    actualHash === expectedHash
  );
}
function arrayBufferToBase64(
  buffer
) {
  const bytes =
    new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(
      byte
    );
  }
  return btoa(binary);
}
function base64ToUint8Array(
  base64
) {
  const binary =
    atob(base64);
  const bytes =
    new Uint8Array(
      binary.length
    );
  for (
    let i = 0;
    i < binary.length;
    i++
  ) {
    bytes[i] =
      binary.charCodeAt(i);
  }
  return bytes;
}