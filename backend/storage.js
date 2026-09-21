export async function getServices(
  db,
  {
    categoryId = null,
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
      s.short_description,
      s.keywords,
      c.name AS category_name,
      o.name AS organization_name
    FROM services s
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
  
  const result = await db.prepare(query).bind(...params).all();
  
  return result.results;
}

export async function getService(
  db,
  serviceId
) {
  const service = await db
    .prepare(`
      SELECT
        s.id,
        s.category_id,
        s.organization_id,
        s.name,
        s.slug,
        s.short_description,
        s.keywords,
        c.name AS category_name,
        o.name AS organization_name,
        o.website_url AS organization_website
      FROM services s
      LEFT JOIN categories c
        ON c.id = s.category_id
      LEFT JOIN organizations o
        ON o.id = s.organization_id
      WHERE s.id = ?
        AND s.status = 1
      LIMIT 1
    `)
    .bind(serviceId)
    .first();
  
  return service || null;
}

export async function createService(
  db,
  {
    id,
    categoryId,
    organizationId = null,
    name,
    slug,
    shortDescription = null,
    keywords = null
  }
) {
  await db
    .prepare(`
      INSERT INTO services (
        id,
        category_id,
        organization_id,
        name,
        slug,
        short_description,
        keywords
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      categoryId,
      organizationId,
      name,
      slug,
      shortDescription,
      keywords
    )
    .run();
  
  return id;
}

export async function getCategories(
  db
) {
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