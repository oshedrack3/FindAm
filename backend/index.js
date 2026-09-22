import {
  handleSchoolRequest
} from "./routes/schools.js";

import {
  handleCourseRequest
} from "./routes/courses.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

function json(data, options = {}) {
  return Response.json(data, {
    ...options,
    headers: {
      ...corsHeaders,
      ...(options.headers || {})
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: corsHeaders
        });
      }

      if (pathname === "/") {
        return json({
          success: true,
          message: "FindAm backend running"
        });
      }

      if (pathname === "/test-db") {
        const result = await env.DB
          .prepare(
            "SELECT 1 AS connected"
          )
          .first();

        return json({
          success: true,
          database: result
        });
      }

      const schoolResponse =
        await handleSchoolRequest(
          request,
          env
        );

      if (schoolResponse) {
        return addCors(
          schoolResponse
        );
      }

      const courseResponse =
        await handleCourseRequest(
          request,
          env
        );

      if (courseResponse) {
        return addCors(
          courseResponse
        );
      }

      return json({
        success: false,
        error: "Route not found"
      }, {
        status: 404
      });

    } catch (error) {
      console.error(
        "Worker error:",
        error
      );

      return json({
        success: false,
        error:
          error.message ||
          "Internal server error"
      }, {
        status: 500
      });
    }
  }
};

function addCors(response) {
  const headers =
    new Headers(
      response.headers
    );

  for (
    const [key, value] of Object.entries(
      corsHeaders
    )
  ) {
    headers.set(
      key,
      value
    );
  }

  return new Response(
    response.body,
    {
      status: response.status,
      statusText: response.statusText,
      headers
    }
  );
}