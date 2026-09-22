import * as storage from "../storage.js";

export async function handleCourseRequest(request, env) {
  const url = new URL(request.url);
  const pathname =
    url.pathname.replace(/\/+$/, "") || "/";

  if (
    request.method === "POST" &&
    pathname === "/admin/courses"
  ) {
    return await createCourseRoute(
      request,
      env
    );
  }

  if (
    request.method === "POST" &&
    pathname === "/admin/course-requirements"
  ) {
    return await createCourseRequirementsRoute(
      request,
      env
    );
  }

  if (
    request.method === "POST" &&
    pathname === "/admin/school-course-requirements"
  ) {
    return await createSchoolCourseRequirementsRoute(
      request,
      env
    );
  }

  if (
    request.method === "GET" &&
    pathname === "/courses"
  ) {
    return await getCoursesRoute(
      url,
      env
    );
  }

  if (
    request.method === "GET" &&
    /^\/courses\/[^/]+$/.test(pathname)
  ) {
    const courseId =
      pathname.split("/")[2];

    return await getCourseRoute(
      env,
      courseId
    );
  }

  if (
    request.method === "GET" &&
    /^\/courses\/[^/]+\/schools\/[^/]+$/.test(pathname)
  ) {
    const parts =
      pathname.split("/");

    const courseId = parts[2];
    const schoolId = parts[4];

    return await getSchoolCourseRoute(
      env,
      schoolId,
      courseId
    );
  }

  return null;
}

async function getCoursesRoute(
  url,
  env
) {
  const search =
    url.searchParams.get("search");

  const limit = Math.min(
    Number(
      url.searchParams.get("limit")
    ) || 20,
    50
  );

  const courses =
    await storage.getCourses(
      env.DB,
      {
        search,
        limit
      }
    );

  return Response.json({
    success: true,
    courses
  });
}

async function getCourseRoute(
  env,
  courseId
) {
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

  return Response.json({
    success: true,
    course
  });
}

async function getSchoolCourseRoute(
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

  const fee =
    school.courses?.[courseId];

  if (fee === undefined) {
    return Response.json({
      success: false,
      error:
        "Course is not offered by this school"
    }, {
      status: 404
    });
  }

  const schoolRequirements =
    await storage.getSchoolCourseRequirements(
      env.DB,
      schoolId,
      courseId
    );

  return Response.json({
    success: true,
    course: {
      ...course,
      fee,
      school_id: schoolId,
      school_requirements:
        schoolRequirements
          ? JSON.parse(
              schoolRequirements.requirements ||
              "{}"
            )
          : null
    }
  });
}

async function createCourseRoute(
  request,
  env
) {
  const body =
    await request.json();

  const {
    id,
    name,
    description
  } = body;

  if (
    id === undefined ||
    !name
  ) {
    return Response.json({
      success: false,
      error:
        "Course ID and name are required"
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

  await storage.createCourse(
    env.DB,
    {
      id,
      name,
      slug,
      description:
        description || null
    }
  );

  return Response.json({
    success: true,
    message:
      "Course created successfully",
    course_id: id
  }, {
    status: 201
  });
}

async function createCourseRequirementsRoute(
  request,
  env
) {
  const body =
    await request.json();

  const {
    course_id,
    requirements
  } = body;

  if (
    course_id === undefined ||
    requirements === undefined
  ) {
    return Response.json({
      success: false,
      error:
        "Course ID and requirements are required"
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

  await storage.createCourseRequirements(
    env.DB,
    {
      courseId: course_id,
      requirements
    }
  );

  return Response.json({
    success: true,
    message:
      "Course requirements created successfully",
    course_id
  }, {
    status: 201
  });
}

async function createSchoolCourseRequirementsRoute(
  request,
  env
) {
  const body =
    await request.json();

  const {
    school_id,
    course_id,
    requirements
  } = body;

  if (
    !school_id ||
    course_id === undefined ||
    requirements === undefined
  ) {
    return Response.json({
      success: false,
      error:
        "School ID, course ID and requirements are required"
    }, {
      status: 400
    });
  }

  const school =
    await storage.getSchool(
      env.DB,
      school_id
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

  if (
    school.courses?.[course_id] ===
    undefined
  ) {
    return Response.json({
      success: false,
      error:
        "Course is not offered by this school"
    }, {
      status: 400
    });
  }

  await storage.createSchoolCourseRequirements(
    env.DB,
    {
      schoolId: school_id,
      courseId: course_id,
      requirements
    }
  );

  return Response.json({
    success: true,
    message:
      "School course requirements created successfully",
    school_id,
    course_id
  }, {
    status: 201
  });
}