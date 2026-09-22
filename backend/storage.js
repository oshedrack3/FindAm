export async function getSolutions(
  db,
  {
    categoryId = null,
    organizationId = null,
    type = null,
    search = null,
    limit = 20
  } = {}
) {
  let query = `
    SELECT
      s.id,
      s.category_id,
      s.organization_id,
      s.name,
      s.slug,
      s.type,
      s.short_description,
      s.keywords,
      c.name AS category_name,
      o.name AS organization_name
    FROM solutions s
    LEFT JOIN categories c
      ON c.id = s.category_id
    LEFT JOIN organizations o
      ON o.id = s.organization_id
    WHERE s.status = 1
  `;
  
  const params = [];
  
  if (categoryId) {
    query += ` AND s.category_id = ?`;
    params.push(categoryId);
  }
  
  if (organizationId) {
    query += ` AND s.organization_id = ?`;
    params.push(organizationId);
  }
  
  if (type) {
    query += ` AND s.type = ?`;
    params.push(type);
  }
  
  if (search) {
    query += `
      AND (
        s.name LIKE ?
        OR s.keywords LIKE ?
        OR s.short_description LIKE ?
      )
    `;
    
    const value = `%${search}%`;
    params.push(value, value, value);
  }
  
  query += ` ORDER BY s.name LIMIT ?`;
  params.push(limit);
  
  const result = await db
    .prepare(query)
    .bind(...params)
    .all();
  
  return result.results;
}
export async function getSolution(
  db,
  solutionId
) {
  const solution = await db
    .prepare(`
      SELECT
        s.id,
        s.category_id,
        s.organization_id,
        s.name,
        s.slug,
        s.type,
        s.short_description,
        s.keywords,
        c.name AS category_name,
        o.name AS organization_name,
        o.website_url AS organization_website,
        o.phone AS organization_phone,
        o.email AS organization_email
      FROM solutions s
      LEFT JOIN categories c
        ON c.id = s.category_id
      LEFT JOIN organizations o
        ON o.id = s.organization_id
      WHERE s.id = ?
        AND s.status = 1
      LIMIT 1
    `)
    .bind(solutionId)
    .first();
  
  if (!solution) {
    return null;
  }
  
  const content = await db
    .prepare(`
      SELECT
        id,
        content,
        source_url,
        verification_status,
        verified_at,
        created_at,
        updated_at
      FROM solution_contents
      WHERE solution_id = ?
      LIMIT 1
    `)
    .bind(solutionId)
    .first();
  
  solution.content = content || null;
  
  return solution;
}
export async function createSolution(
  db,
  {
    id,
    categoryId = null,
    organizationId = null,
    name,
    slug,
    type,
    shortDescription = null,
    keywords = null,
    content = null,
    sourceUrl = null,
    verificationStatus = "unverified",
    verifiedAt = null
  }
) {
  await db
    .prepare(`
      INSERT INTO solutions (
        id,
        category_id,
        organization_id,
        name,
        slug,
        type,
        short_description,
        keywords
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      categoryId,
      organizationId,
      name,
      slug,
      type,
      shortDescription,
      keywords
    )
    .run();
  
  if (content) {
    await db
      .prepare(`
        INSERT INTO solution_contents (
          id,
          solution_id,
          content,
          source_url,
          verification_status,
          verified_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        crypto.randomUUID(),
        id,
        content,
        sourceUrl,
        verificationStatus,
        verifiedAt
      )
      .run();
  }
  
  return id;
}
export async function getCategories(db) {
  const result = await db
    .prepare(`
      SELECT
        id,
        name,
        slug,
        description,
        icon
      FROM categories
      WHERE status = 1
      ORDER BY name
    `)
    .all();
  
  return result.results;
}
export async function getOrganizations(
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
      description,
      website_url,
      phone,
      email,
      address
    FROM organizations
    WHERE status = 1
  `;
  
  const params = [];
  
  if (search) {
    query += `
      AND (
        name LIKE ?
        OR description LIKE ?
      )
    `;
    
    const value = `%${search}%`;
    params.push(value, value);
  }
  
  query += ` ORDER BY name LIMIT ?`;
  params.push(limit);
  
  const result = await db
    .prepare(query)
    .bind(...params)
    .all();
  
  return result.results;
}
export async function getOrganization(
  db,
  organizationId
) {
  return await db
    .prepare(`
      SELECT
        id,
        name,
        slug,
        description,
        website_url,
        phone,
        email,
        address
      FROM organizations
      WHERE id = ?
        AND status = 1
      LIMIT 1
    `)
    .bind(organizationId)
    .first();
}
export async function getPlaces(
  db,
  {
    organizationId = null,
    city = null,
    state = null,
    search = null,
    limit = 20
  } = {}
) {
  let query = `
    SELECT
      p.id,
      p.organization_id,
      p.name,
      p.slug,
      p.description,
      p.address,
      p.city,
      p.state,
      p.phone,
      p.email,
      p.website_url,
      p.opening_hours,
      p.latitude,
      p.longitude,
      o.name AS organization_name
    FROM places p
    LEFT JOIN organizations o
      ON o.id = p.organization_id
    WHERE p.status = 1
  `;
  
  const params = [];
  
  if (organizationId) {
    query += ` AND p.organization_id = ?`;
    params.push(organizationId);
  }
  
  if (city) {
    query += ` AND p.city = ?`;
    params.push(city);
  }
  
  if (state) {
    query += ` AND p.state = ?`;
    params.push(state);
  }
  
  if (search) {
    query += `
      AND (
        p.name LIKE ?
        OR p.address LIKE ?
        OR p.city LIKE ?
        OR p.state LIKE ?
      )
    `;
    
    const value = `%${search}%`;
    params.push(value, value, value, value);
  }
  
  query += ` ORDER BY p.name LIMIT ?`;
  params.push(limit);
  
  const result = await db
    .prepare(query)
    .bind(...params)
    .all();
  
  return result.results;
}
export async function getPlace(
  db,
  placeId
) {
  return await db
    .prepare(`
      SELECT
        p.id,
        p.organization_id,
        p.name,
        p.slug,
        p.description,
        p.address,
        p.city,
        p.state,
        p.phone,
        p.email,
        p.website_url,
        p.opening_hours,
        p.latitude,
        p.longitude,
        o.name AS organization_name,
        o.website_url AS organization_website
      FROM places p
      LEFT JOIN organizations o
        ON o.id = p.organization_id
      WHERE p.id = ?
        AND p.status = 1
      LIMIT 1
    `)
    .bind(placeId)
    .first();
}
export async function getNeeds(
  db,
  {
    solutionId = null,
    type = null,
    search = null,
    limit = 20
  } = {}
) {
  let query = `
    SELECT
      n.id,
      n.solution_id,
      n.phrase,
      n.type,
      s.name AS solution_name
    FROM needs n
    LEFT JOIN solutions s
      ON s.id = n.solution_id
    WHERE n.status = 1
  `;
  
  const params = [];
  
  if (solutionId) {
    query += ` AND n.solution_id = ?`;
    params.push(solutionId);
  }
  
  if (type) {
    query += ` AND n.type = ?`;
    params.push(type);
  }
  
  if (search) {
    query += ` AND n.phrase LIKE ?`;
    params.push(`%${search}%`);
  }
  
  query += ` ORDER BY n.phrase LIMIT ?`;
  params.push(limit);
  
  const result = await db
    .prepare(query)
    .bind(...params)
    .all();
  
  return result.results;
}
export async function createNeed(
  db,
  {
    id,
    solutionId = null,
    phrase,
    type = null
  }
) {
  await db
    .prepare(`
      INSERT INTO needs (
        id,
        solution_id,
        phrase,
        type
      )
      VALUES (?, ?, ?, ?)
    `)
    .bind(
      id,
      solutionId,
      phrase,
      type
    )
    .run();
  
  return id;
}







export async function searchSolutions(
  db,
  search,
  limit = 20
) {
  const value = search
    .trim()
    .toLowerCase();
  
  if (!value) {
    return [];
  }
  
  const searchValue = `%${value}%`;
  
  const result = await db
    .prepare(`
      SELECT
        s.id,
        s.category_id,
        s.organization_id,
        s.name,
        s.slug,
        s.type,
        s.short_description,
        s.keywords,
        c.name AS category_name,
        o.name AS organization_name
      FROM solutions s
      LEFT JOIN categories c
        ON c.id = s.category_id
      LEFT JOIN organizations o
        ON o.id = s.organization_id
      WHERE s.status = 1
        AND (
          LOWER(s.name) LIKE ?
          OR LOWER(s.keywords) LIKE ?
          OR LOWER(s.short_description) LIKE ?
          OR EXISTS (
            SELECT 1
            FROM needs n
            WHERE n.solution_id = s.id
              AND n.status = 1
              AND LOWER(n.phrase) LIKE ?
          )
          OR LOWER(c.name) LIKE ?
          OR LOWER(o.name) LIKE ?
        )
      ORDER BY
        CASE
          WHEN LOWER(s.name) = ? THEN 1
          WHEN LOWER(s.name) LIKE ? THEN 2
          WHEN LOWER(s.keywords) LIKE ? THEN 3
          ELSE 4
        END,
        s.name
      LIMIT ?
    `)
    .bind(
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      value,
      `${value}%`,
      searchValue,
      limit
    )
    .all();
  
  return result.results;
}
