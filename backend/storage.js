export async function getSchools(
  db,
  {
    type = null,
    ownership = null,
    state = null,
    city = null,
    search = null,
    limit = 20
  } = {}
) {
  let query = `
    SELECT
      id,
      name,
      short_name,
      slug,
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
    FROM schools
    WHERE status = 1
  `;

  const params = [];

  if (type) {
    query += ` AND type = ?`;
    params.push(type);
  }

  if (ownership) {
    query += ` AND ownership = ?`;
    params.push(ownership);
  }

  if (state) {
    query += ` AND state = ?`;
    params.push(state);
  }

  if (city) {
    query += ` AND city = ?`;
    params.push(city);
  }

  if (search) {
    query += `
      AND (
        name LIKE ?
        OR short_name LIKE ?
        OR city LIKE ?
        OR state LIKE ?
      )
    `;

    const value = `%${search}%`;
    params.push(
      value,
      value,
      value,
      value
    );
  }

  query += ` ORDER BY name LIMIT ?`;
  params.push(limit);

  const result = await db
    .prepare(query)
    .bind(...params)
    .all();

  return result.results.map(
    school => ({
      ...school,
      courses: JSON.parse(
        school.courses || "{}"
      )
    })
  );
}

export async function getSchool(
  db,
  schoolId
) {
  const school = await db
    .prepare(`
      SELECT
        id,
        name,
        short_name,
        slug,
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
      FROM schools
      WHERE id = ?
        AND status = 1
      LIMIT 1
    `)
    .bind(schoolId)
    .first();

  if (!school) {
    return null;
  }

  school.courses = JSON.parse(
    school.courses || "{}"
  );

  return school;
}

export async function createSchool(
  db,
  {
    id,
    name,
    shortName = null,
    slug,
    type,
    ownership,
    state = null,
    city = null,
    address = null,
    latitude = null,
    longitude = null,
    courses = {},
    description = null,
    websiteUrl = null,
    logoUrl = null
  }
) {
  await db
    .prepare(`
      INSERT INTO schools (
        id,
        name,
        short_name,
        slug,
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
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      name,
      shortName,
      slug,
      type,
      ownership,
      state,
      city,
      address,
      latitude,
      longitude,
      JSON.stringify(courses),
      description,
      websiteUrl,
      logoUrl
    )
    .run();

  return id;
}

export async function getCourses(
  db,
  {
    search = null,
    limit = 20
  } = {}
) {
  let query = `
    SELECT
      id,
      name,
      slug,
      description
    FROM courses
    WHERE status = 1
  `;

  const params = [];

  if (search) {
    query += `
      AND (
        name LIKE ?
        OR slug LIKE ?
        OR description LIKE ?
      )
    `;

    const value = `%${search}%`;
    params.push(
      value,
      value,
      value
    );
  }

  query += ` ORDER BY id LIMIT ?`;
  params.push(limit);

  const result = await db
    .prepare(query)
    .bind(...params)
    .all();

  return result.results;
}
export async function getCoursesByIds(
  db,
  courseIds
) {
  if (!courseIds.length) {
    return [];
  }
  
  const placeholders =
    courseIds.map(() => "?").join(", ");
  
  const result = await db
    .prepare(`
      SELECT
        id,
        name,
        slug,
        description
      FROM courses
      WHERE id IN (${placeholders})
        AND status = 1
      ORDER BY id
    `)
    .bind(...courseIds)
    .all();
  
  return result.results;
}
export async function getCourse(
  db,
  courseId
) {
  const course = await db
    .prepare(`
      SELECT
        id,
        name,
        slug,
        description
      FROM courses
      WHERE id = ?
        AND status = 1
      LIMIT 1
    `)
    .bind(courseId)
    .first();

  if (!course) {
    return null;
  }

  const requirements = await db
    .prepare(`
      SELECT
        id,
        requirements
      FROM course_requirements
      WHERE id = ?
      LIMIT 1
    `)
    .bind(courseId)
    .first();

  course.requirements =
    requirements
      ? JSON.parse(
          requirements.requirements || "{}"
        )
      : null;

  return course;
}

export async function createCourse(
  db,
  {
    id,
    name,
    slug,
    description = null
  }
) {
  await db
    .prepare(`
      INSERT INTO courses (
        id,
        name,
        slug,
        description
      )
      VALUES (?, ?, ?, ?)
    `)
    .bind(
      id,
      name,
      slug,
      description
    )
    .run();

  return id;
}

export async function createCourseRequirements(
  db,
  {
    courseId,
    requirements = {}
  }
) {
  await db
    .prepare(`
      INSERT INTO course_requirements (
        id,
        requirements
      )
      VALUES (?, ?)
    `)
    .bind(
      courseId,
      JSON.stringify(requirements)
    )
    .run();

  return courseId;
}

export async function getSchoolCourseRequirements(
  db,
  schoolId,
  courseId
) {
  return await db
    .prepare(`
      SELECT
        school_id,
        course_id,
        requirements
      FROM school_course_requirements
      WHERE school_id = ?
        AND course_id = ?
      LIMIT 1
    `)
    .bind(
      schoolId,
      courseId
    )
    .first();
}

export async function createSchoolCourseRequirements(
  db,
  {
    schoolId,
    courseId,
    requirements = {}
  }
) {
  await db
    .prepare(`
      INSERT INTO school_course_requirements (
        school_id,
        course_id,
        requirements
      )
      VALUES (?, ?, ?)
    `)
    .bind(
      schoolId,
      courseId,
      JSON.stringify(requirements)
    )
    .run();

  return {
    schoolId,
    courseId
  };
}

export async function updateSchoolCourses(
  db,
  schoolId,
  courses
) {
  await db
    .prepare(`
      UPDATE schools
      SET
        courses = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .bind(
      JSON.stringify(courses),
      schoolId
    )
    .run();

  return schoolId;
}