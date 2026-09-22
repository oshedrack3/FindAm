import * as storage from "../storage.js";

export async function handleSchoolRequest(request, env) {
  const url = new URL(request.url);
  const pathname =
    url.pathname.replace(/\/+$/, "") || "/";

  if (
    request.method === "POST" &&
    pathname === "/admin/schools"
  ) {
    return await createSchoolRoute(
      request,
      env
    );
  }

  if (
    request.method === "GET" &&
    pathname === "/schools"
  ) {
    return await getSchoolsRoute(
      url,
      env
    );
  }

  if (
    request.method === "GET" &&
    pathname === "/search/schools"
  ) {
    return await searchSchoolsRoute(
      url,
      env
    );
  }

  if (
    request.method === "GET" &&
    /^\/schools\/[^/]+$/.test(pathname)
  ) {
    const schoolId =
      pathname.split("/")[2];

    return await getSchoolRoute(
      env,
      schoolId
    );
  }

  return null;
}

async function getSchoolsRoute(
  url,
  env
) {
  const type =
    url.searchParams.get("type");

  const ownership =
    url.searchParams.get("ownership");

  const state =
    url.searchParams.get("state");

  const city =
    url.searchParams.get("city");

  const search =
    url.searchParams.get("search");

  const limit = Math.min(
    Number(
      url.searchParams.get("limit")
    ) || 20,
    50
  );

  const schools =
    await storage.getSchools(
      env.DB,
      {
        type,
        ownership,
        state,
        city,
        search,
        limit
      }
    );

  return Response.json({
    success: true,
    schools
  });
}

async function searchSchoolsRoute(
  url,
  env
) {
  const search =
    url.searchParams.get("q") || "";

  const limit = Math.min(
    Number(
      url.searchParams.get("limit")
    ) || 20,
    50
  );

  if (!search.trim()) {
    return Response.json({
      success: false,
      error: "Search query is required"
    }, {
      status: 400
    });
  }

  const schools =
    await storage.getSchools(
      env.DB,
      {
        search,
        limit
      }
    );

  return Response.json({
    success: true,
    query: search,
    schools
  });
}

async function getSchoolRoute(
  env,
  schoolId
) {
  const school =
    await storage.getSchool(
      env.DB,
      schoolId
    );

  if (!school) {
    return Response.json({
      success: false,
      error: "School not found"
    }, {
      status: 404
    });
  }

  return Response.json({
    success: true,
    school
  });
}

async function createSchoolRoute(
  request,
  env
) {
  const body =
    await request.json();

  const {
    name,
    short_name,
    type,
    ownership,
    state,
    city,
    address,
    latitude,
    longitude,
    courses,
    description,
    website_url,
    logo_url
  } = body;

  if (
    !name ||
    !type ||
    !ownership
  ) {
    return Response.json({
      success: false,
      error:
        "Name, type and ownership are required"
    }, {
      status: 400
    });
  }

  const schoolId =
    crypto.randomUUID();

  const slug = name
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );

  await storage.createSchool(
    env.DB,
    {
      id: schoolId,
      name,
      shortName:
        short_name || null,
      slug,
      type,
      ownership,
      state:
        state || null,
      city:
        city || null,
      address:
        address || null,
      latitude:
        latitude || null,
      longitude:
        longitude || null,
      courses:
        courses || {},
      description:
        description || null,
      websiteUrl:
        website_url || null,
      logoUrl:
        logo_url || null
    }
  );

  return Response.json({
    success: true,
    message:
      "School created successfully",
    school_id: schoolId
  }, {
    status: 201
  });
}