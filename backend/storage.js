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
      id,
      category_id,
      organization_id,
      name,
      slug,
      short_description,
      keywords,
      verified_at
    FROM services
    WHERE status = 1
  `;
  
  const params = [];
  
  if (categoryId) {
    query += ` AND category_id = ?`;
    params.push(categoryId);
  }
  
  if (search) {
    query += `
      AND (
        name LIKE ?
        OR keywords LIKE ?
      )
    `;
    
    const value = `%${search}%`;
    
    params.push(
      value,
      value
    );
  }
  
  query += `
    ORDER BY name
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
  return await db
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
        o.name AS organization_name,
        c.name AS category_name,
        sc.description,
        sc.requirements,
        sc.steps,
        sc.fee,
        sc.processing_time,
        sc.notes,
        sc.official_url,
        sc.source_url
      FROM services s
      LEFT JOIN organizations o
        ON o.id = s.organization_id
      LEFT JOIN categories c
        ON c.id = s.category_id
      LEFT JOIN service_contents sc
        ON sc.service_id = s.id
      WHERE s.id = ?
        AND s.status = 1
      LIMIT 1
    `)
    .bind(serviceId)
    .first();
}
