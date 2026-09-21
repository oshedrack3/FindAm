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
      s.verified_at,
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
    query += `
      AND s.category_id = ?
    `;
    
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
    
    params.push(
      value,
      value,
      value
    );
  }
  
  query += `
    ORDER BY s.name
    LIMIT ?
  `;
  
  params.push(limit);
  
  const result =
    await db
    .prepare(query)
    .bind(...params)
    .all();
  
  return result.results;
}

export async function getService(
  db,
  serviceId
) {
  const service =
    await db
    .prepare(`
        SELECT
          s.id,
          s.category_id,
          s.organization_id,
          s.name,
          s.slug,
          s.short_description,
          s.keywords,
          s.verified_at,
          s.source_url,
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
  
  if (!service) {
    return null;
  }
  
  const links =
    await db
    .prepare(`
        SELECT
          id,
          title,
          url,
          type,
          is_official
        FROM service_links
        WHERE service_id = ?
          AND status = 1
        ORDER BY is_official DESC, title
      `)
    .bind(serviceId)
    .all();
  
  service.links = links.results;
  
  return service;
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
    keywords = null,
    sourceUrl,
    verifiedAt,
    links = []
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
        keywords,
        source_url,
        verified_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      categoryId,
      organizationId,
      name,
      slug,
      shortDescription,
      keywords,
      sourceUrl,
      verifiedAt
    )
    .run();
  
  for (const link of links) {
    if (
      !link.title ||
      !link.url
    ) {
      continue;
    }
    
    await db
      .prepare(`
        INSERT INTO service_links (
          id,
          service_id,
          title,
          url,
          type,
          is_official
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        crypto.randomUUID(),
        id,
        link.title,
        link.url,
        link.type ||
        "information",
        link.is_official ?
        1 :
        0
      )
      .run();
  }
  
  return id;
}