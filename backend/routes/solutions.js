import * as storage from "../storage/index.js";

export async function handleSolutionRequest(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  
  if (
    request.method === "POST" &&
    pathname === "/admin/solutions"
  ) {
    return await createSolutionRoute(request, env);
  }
  if (
    request.method === "GET" &&
    pathname === "/search"
  ) {
    return await searchSolutionsRoute(url, env);
  }
  if (
    request.method === "GET" &&
    pathname === "/solutions"
  ) {
    return await getSolutionsRoute(url, env);
  }
  
  if (
    request.method === "GET" &&
    /^\/solutions\/[^/]+$/.test(pathname)
  ) {
    const solutionId = pathname.split("/")[2];
    
    return await getSolutionRoute(
      env,
      solutionId
    );
  }
  
  return null;
}

async function getSolutionsRoute(url, env) {
  const categoryId =
    url.searchParams.get("category");
  
  const organizationId =
    url.searchParams.get("organization");
  
  const type =
    url.searchParams.get("type");
  
  const search =
    url.searchParams.get("search");
  
  const limit = Math.min(
    Number(url.searchParams.get("limit")) || 20,
    50
  );
  
  const solutions =
    await storage.getSolutions(env.DB, {
      categoryId,
      organizationId,
      type,
      search,
      limit
    });
  
  return Response.json({
    success: true,
    solutions
  });
}

async function getSolutionRoute(
  env,
  solutionId
) {
  const solution =
    await storage.getSolution(
      env.DB,
      solutionId
    );
  
  if (!solution) {
    return Response.json({
      success: false,
      error: "Solution not found"
    }, {
      status: 404
    });
  }
  
  return Response.json({
    success: true,
    solution
  });
}

async function createSolutionRoute(
  request,
  env
) {
  const body = await request.json();
  
  const {
    name,
    category_id,
    organization_id,
    type,
    short_description,
    keywords,
    content,
    source_url,
    verification_status,
    verified_at
  } = body;
  
  if (!name || !category_id || !type) {
    return Response.json({
      success: false,
      error: "Name, category and type are required"
    }, {
      status: 400
    });
  }
  
  const solutionId =
    crypto.randomUUID();
  
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  
  await storage.createSolution(
    env.DB,
    {
      id: solutionId,
      categoryId: category_id,
      organizationId: organization_id || null,
      name,
      slug,
      type,
      shortDescription: short_description || null,
      keywords: keywords || null,
      content: content || null,
      sourceUrl: source_url || null,
      verificationStatus: verification_status ||
        "unverified",
      verifiedAt: verified_at || null
    }
  );
  
  return Response.json({
    success: true,
    message: "Solution created successfully",
    solution_id: solutionId
  }, {
    status: 201
  });
}



async function searchSolutionsRoute(url, env) {
  const search =
    url.searchParams.get("q") || "";
  
  const limit = Math.min(
    Number(url.searchParams.get("limit")) || 20,
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
  
  const solutions =
    await storage.searchSolutions(
      env.DB,
      search,
      limit
    );
  
  return Response.json({
    success: true,
    query: search,
    solutions
  });
}

// end