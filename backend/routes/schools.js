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
    request.method === "PATCH" &&
    /^\/admin\/schools\/[^/]+$/.test(pathname)
  ) {
    const schoolId =
      pathname.split("/")[3];

    return await updateSchoolRoute(
      request,
      env,
      schoolId
    );
  }

  if (
    request.method === "POST" &&
    /^\/admin\/schools\/[^/]+\/courses$/.test(pathname)
  ) {
    const schoolId =
      pathname.split("/")[3];

    return await createSchoolCourseRoute(
      request,
      env,
      schoolId
    );
  }

  if (
    request.method === "GET" &&
    /^\/schools\/[^/]+\/courses\/[^/]+\/fees$/.test(pathname)
  ) {
    const parts =
      pathname.split("/");

    const schoolId = parts[2];
    const courseId = parts[4];

    return await getSchoolCourseFeesRoute(
      env,
      schoolId,
      courseId
    );
  }
  if (
  request.method === "GET" &&
  pathname === "/schools/featured"
) {
  return await getFeaturedSchoolsRoute(
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
    /^\/schools\/[^/]+\/courses$/.test(pathname)
  ) {
    const schoolId =
      pathname.split("/")[2];

    return await getSchoolCoursesRoute(
      env,
      schoolId
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

async function requireSchoolAdmin(
  request,
  env
) {
  const auth =
    await authenticate(
      request,
      env
    );

  if (!auth.success) {
    return Response.json({
      success: false,
      error: auth.message
    }, {
      status: auth.status
    });
  }

  if (
    auth.user.role !== "admin" &&
    auth.user.role !== "owner"
  ) {
    return Response.json({
      success: false,
      error:
        "Admin or owner access required"
    }, {
      status: 403
    });
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
  const authError =
    await requireSchoolAdmin(
      request,
      env
    );

  if (authError) {
    return authError;
  }

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
    description,
    website_url,
    logo_url,
    established_year
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
      description:
        description || null,
      websiteUrl:
        website_url || null,
      logoUrl:
        logo_url || null,
      establishedYear:
        established_year || null
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

async function updateSchoolRoute(
  request,
  env,
  schoolId
) {
  const authError =
    await requireSchoolAdmin(
      request,
      env
    );

  if (authError) {
    return authError;
  }

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
    description,
    website_url,
    logo_url,
    established_year
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

  await storage.updateSchool(
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
      description:
        description || null,
      websiteUrl:
        website_url || null,
      logoUrl:
        logo_url || null,
      establishedYear:
        established_year || null
    }
  );

  return Response.json({
    success: true,
    message:
      "School updated successfully",
    school_id: schoolId
  });
}

async function getSchoolCoursesRoute(
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

  const courses =
    await storage.getSchoolCourses(
      env.DB,
      schoolId
    );

  return Response.json({
    success: true,
    courses
  });
}

async function createSchoolCourseRoute(
  request,
  env,
  schoolId
) {
  const authError =
    await requireSchoolAdmin(
      request,
      env
    );

  if (authError) {
    return authError;
  }

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

  const body =
    await request.json();

  const {
    course_id
  } = body;

  if (!course_id) {
    return Response.json({
      success: false,
      error: "Course ID is required"
    }, {
      status: 400
    });
  }

  const course =
    await storage.getCourse(
      env.DB,
      course_id
    );

  if (!course) {
    return Response.json({
      success: false,
      error: "Course not found"
    }, {
      status: 404
    });
  }

  await storage.createSchoolCourse(
    env.DB,
    {
      schoolId,
      courseId: course_id
    }
  );

  return Response.json({
    success: true,
    message:
      "Course added to school successfully",
    school_id: schoolId,
    course_id
  }, {
    status: 201
  });
}

async function getSchoolCourseFeesRoute(
  env,
  schoolId,
  courseId
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

  const course =
    await storage.getCourse(
      env.DB,
      courseId
    );

  if (!course) {
    return Response.json({
      success: false,
      error: "Course not found"
    }, {
      status: 404
    });
  }

  const schoolCourse =
    await storage.getSchoolCourse(
      env.DB,
      schoolId,
      courseId
    );

  if (!schoolCourse) {
    return Response.json({
      success: false,
      error:
        "Course is not offered by this school"
    }, {
      status: 404
    });
  }

  const fees =
    await storage.getSchoolCourseFees(
      env.DB,
      schoolId,
      courseId
    );

  return Response.json({
    success: true,
    fees
  });
}


async function getFeaturedSchoolsRoute(
  url,
  env
) {
  const limit = Math.min(
    Number(
      url.searchParams.get("limit")
    ) || 10,
    50
  );
  
  const schools =
    await storage.getFeaturedSchools(
      env.DB,
      limit
    );
  
  return Response.json({
    success: true,
    schools
  });
}