import {
  getServices,
  getService,
  createService
} from "../storage.js";

export async function handleServiceRequest(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  if (request.method === "POST" && pathname === "/admin/services") {
    return await createServiceRoute(request, env);
  }

  if (request.method === "POST" && pathname === "/admin/services/import-manual") {
    return await manualImportServiceRoute(request);
  }

  if (request.method === "POST" && pathname === "/admin/services/import") {
    return await importServiceRoute(request, env);
  }

  if (request.method === "GET" && pathname === "/services") {
    return await getServicesRoute(url, env);
  }

  if (request.method === "GET" && /^\/services\/[^/]+$/.test(pathname)) {
    const serviceId = pathname.split("/")[2];
    return await getServiceRoute(env, serviceId);
  }

  return null;
}

async function getServicesRoute(url, env) {
  const categoryId = url.searchParams.get("category");
  const search = url.searchParams.get("search");

  const limit = Math.min(
    Number(url.searchParams.get("limit")) || 20,
    50
  );

  const services = await getServices(env.DB, {
    categoryId,
    search,
    limit
  });

  return Response.json({
    success: true,
    services
  });
}

async function getServiceRoute(env, serviceId) {
  const service = await getService(env.DB, serviceId);

  if (!service) {
    return Response.json({
      success: false,
      error: "Service not found"
    }, {
      status: 404
    });
  }

  return Response.json({
    success: true,
    service
  });
}

async function importServiceRoute(request, env) {
  const body = await request.json();
  const sourceUrl = body.source_url;

  if (!sourceUrl) {
    return Response.json({
      success: false,
      error: "Source URL is required"
    }, {
      status: 400
    });
  }

  let url;

  try {
    url = new URL(sourceUrl);
  } catch {
    return Response.json({
      success: false,
      error: "Invalid source URL"
    }, {
      status: 400
    });
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return Response.json({
      success: false,
      error: "Only HTTP and HTTPS URLs are allowed"
    }, {
      status: 400
    });
  }

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent": "FindAm Service Importer"
      }
    });

    if (!response.ok) {
      return Response.json({
        success: false,
        error: `Unable to fetch source page. Status: ${response.status}`
      }, {
        status: 400
      });
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      return Response.json({
        success: false,
        error: "The source URL does not contain an HTML webpage."
      }, {
        status: 400
      });
    }

    const html = await response.text();

    const title = html.match(
      /<title[^>]*>([\s\S]*?)<\/title>/i
    )?.[1]?.replace(/\s+/g, " ").trim() || null;

    const description =
      html.match(
        /<meta[^>]+(?:name=["']description["'][^>]+content=["']([^"']*)["']|content=["']([^"']*)["'][^>]+name=["']description["'])/i
      )?.[1] ||
      html.match(
        /<meta[^>]+(?:name=["']description["'][^>]+content=["']([^"']*)["']|content=["']([^"']*)["'][^>]+name=["']description["'])/i
      )?.[2] ||
      null;

    const headings = [
      ...html.matchAll(
        /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi
      )
    ]
      .map(match =>
        match[1]
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      )
      .filter(Boolean)
      .slice(0, 20);

    const links = [
      ...html.matchAll(
        /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
      )
    ]
      .map(match => {
        const text = match[2]
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        try {
          return {
            title: text,
            url: new URL(match[1], sourceUrl).href
          };
        } catch {
          return null;
        }
      })
      .filter(link => link && link.title)
      .slice(0, 50);

    const draft = createServiceDraft(sourceUrl, {
      title,
      description,
      headings,
      links
    });

    return Response.json({
      success: true,
      draft
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message || "Unable to analyze source page"
    }, {
      status: 500
    });
  }
}

async function manualImportServiceRoute(request) {
  try {
    const body = await request.json();
    const sourceUrl = body.source_url;
    const content = body.content;

    if (!sourceUrl) {
      return Response.json({
        success: false,
        error: "Source URL is required"
      }, {
        status: 400
      });
    }

    if (!content) {
      return Response.json({
        success: false,
        error: "Page content is required"
      }, {
        status: 400
      });
    }

    let url;

    try {
      url = new URL(sourceUrl);
    } catch {
      return Response.json({
        success: false,
        error: "Invalid source URL"
      }, {
        status: 400
      });
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return Response.json({
        success: false,
        error: "Only HTTP and HTTPS URLs are allowed"
      }, {
        status: 400
      });
    }

    const cleanContent = content
      .replace(/\r/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const lines = cleanContent
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

    const title = lines[0] || null;
    const headings = lines.slice(0, 20);
    const description = lines.slice(1, 4).join(" ");

    const draft = createServiceDraft(sourceUrl, {
      title,
      description,
      headings,
      links: []
    });

    return Response.json({
      success: true,
      draft
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message || "Unable to analyze copied page content"
    }, {
      status: 500
    });
  }
}

function createServiceDraft(sourceUrl, page) {
  const name =
    page.title ||
    page.headings[0] ||
    "Untitled Service";

  const description =
    page.description ||
    page.headings.slice(0, 3).join(". ");

  const cleanText = text =>
    text
      .replace(/&amp;/g, "&")
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();

  const uniqueHeadings = [
    ...new Set(
      page.headings
        .map(cleanText)
        .filter(Boolean)
    )
  ];

  const keywords = [
    name,
    ...uniqueHeadings
  ]
    .map(cleanText)
    .filter(Boolean)
    .filter(
      (value, index, array) =>
        array.indexOf(value) === index
    )
    .join(", ");

  return {
    name: cleanText(name),
    short_description: cleanText(description) || null,
    keywords,
    source_url: sourceUrl,
    links: page.links
  };
}

async function createServiceRoute(request, env) {
  const body = await request.json();

  const {
    name,
    category_id,
    organization_id,
    short_description,
    keywords
  } = body;

  if (!name || !category_id) {
    return Response.json({
      success: false,
      error: "Name and category are required"
    }, {
      status: 400
    });
  }

  const serviceId = crypto.randomUUID();

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  await createService(env.DB, {
    id: serviceId,
    categoryId: category_id,
    organizationId: organization_id || null,
    name,
    slug,
    shortDescription: short_description || null,
    keywords: keywords || null
  });

  return Response.json({
    success: true,
    message: "Service created successfully",
    service_id: serviceId
  }, {
    status: 201
  });
}