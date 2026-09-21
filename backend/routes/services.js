import {
  getServices,
  getService
} from "../storage.js";

export async function handleServiceRequest(
  request,
  env
) {
  const url = new URL(request.url);
  
  const pathname =
    url.pathname.replace(/\/+$/, "") || "/";
  
  if (
    request.method === "GET" &&
    pathname === "/services"
  ) {
    return await getServicesRoute(
      url,
      env
    );
  }
  
  if (
    request.method === "GET" &&
    /^\/services\/[^/]+$/.test(pathname)
  ) {
    const serviceId =
      pathname.split("/")[2];
    
    return await getServiceRoute(
      env,
      serviceId
    );
  }
  
  return null;
}

async function getServicesRoute(
  url,
  env
) {
  const categoryId =
    url.searchParams.get(
      "category"
    );
  
  const search =
    url.searchParams.get(
      "search"
    );
  
  const limit =
    Math.min(
      Number(
        url.searchParams.get(
          "limit"
        )
      ) || 20,
      50
    );
  
  const services =
    await getServices(
      env.DB,
      {
        categoryId,
        search,
        limit
      }
    );
  
  return Response.json({
    success: true,
    services
  });
}

async function getServiceRoute(
  env,
  serviceId
) {
  const service =
    await getService(
      env.DB,
      serviceId
    );
  
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


// End