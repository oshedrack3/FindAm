const API =
  "https://findam-backend.oshedrack3.workers.dev";

async function apiRequest(
  endpoint,
  options = {},
  retry = true
) {
  showLoader();

  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
      controller.abort();
    }, 15000);

  try {
    const res =
      await fetch(
        `${API}${endpoint}`,
        {
          ...options,
          signal: controller.signal
        }
      );

    clearTimeout(timeout);
    hideLoader();

    return res;

  } catch (err) {
    clearTimeout(timeout);
    hideLoader();

    if (
      err.name === "AbortError"
    ) {
      if (!retry) {
        return null;
      }

      showConfirmModal(
        "Network is taking too long. Do you want to retry?",
        "Retry Again",
        "Cancel"
      );

      return await new Promise(
        resolve => {
          confirmYes = async () => {
            closeConfirmModal();

            const result =
              await apiRequest(
                endpoint,
                options,
                true
              );

            resolve(result);
          };

          confirmNo = () => {
            closeConfirmModal();
            resolve(null);
          };
        }
      );
    }

    throw err;
  }
}

async function searchSchools(
  search,
  limit = 20
) {
  const params =
    new URLSearchParams();

  params.set(
    "q",
    search
  );

  params.set(
    "limit",
    limit
  );

  const res =
    await apiRequest(
      `/search/schools?${params.toString()}`,
      {},
      true
    );

  if (!res) {
    return [];
  }

  const result =
    await res.json();

  if (
    !res.ok ||
    !result.success
  ) {
    throw new Error(
      result.error ||
      "School search failed."
    );
  }

  return result.schools || [];
}

async function getSchools(
  type = null,
  ownership = null,
  state = null,
  city = null,
  search = "",
  limit = 20
) {
  const params =
    new URLSearchParams();

  if (type) {
    params.set(
      "type",
      type
    );
  }

  if (ownership) {
    params.set(
      "ownership",
      ownership
    );
  }

  if (state) {
    params.set(
      "state",
      state
    );
  }

  if (city) {
    params.set(
      "city",
      city
    );
  }

  if (search) {
    params.set(
      "search",
      search
    );
  }

  params.set(
    "limit",
    limit
  );

  const res =
    await apiRequest(
      `/schools?${params.toString()}`,
      {},
      true
    );

  if (!res) {
    return [];
  }

  const result =
    await res.json();

  if (
    !res.ok ||
    !result.success
  ) {
    throw new Error(
      result.error ||
      "Failed to load schools."
    );
  }

  return result.schools || [];
}

async function getSchool(
  schoolId
) {
  const res =
    await apiRequest(
      `/schools/${encodeURIComponent(schoolId)}`,
      {},
      true
    );

  if (!res) {
    return null;
  }

  const result =
    await res.json();

  if (
    !res.ok ||
    !result.success
  ) {
    throw new Error(
      result.error ||
      "Failed to load school."
    );
  }

  return result.school;
}

async function getCourses(
  search = "",
  limit = 20
) {
  const params =
    new URLSearchParams();

  if (search) {
    params.set(
      "search",
      search
    );
  }

  params.set(
    "limit",
    limit
  );

  const res =
    await apiRequest(
      `/courses?${params.toString()}`,
      {},
      true
    );

  if (!res) {
    return [];
  }

  const result =
    await res.json();

  if (
    !res.ok ||
    !result.success
  ) {
    throw new Error(
      result.error ||
      "Failed to load courses."
    );
  }

  return result.courses || [];
}

async function getCourse(
  courseId
) {
  const res =
    await apiRequest(
      `/courses/${encodeURIComponent(courseId)}`,
      {},
      true
    );

  if (!res) {
    return null;
  }

  const result =
    await res.json();

  if (
    !res.ok ||
    !result.success
  ) {
    throw new Error(
      result.error ||
      "Failed to load course."
    );
  }

  return result.course;
}

async function getSchoolCourse(
  schoolId,
  courseId
) {
  const res =
    await apiRequest(
      `/courses/${encodeURIComponent(courseId)}/schools/${encodeURIComponent(schoolId)}`,
      {},
      true
    );

  if (!res) {
    return null;
  }

  const result =
    await res.json();

  if (
    !res.ok ||
    !result.success
  ) {
    throw new Error(
      result.error ||
      "Failed to load school course."
    );
  }

  return result.course;
}
async function getSchoolCourses(
  schoolId
) {
  const res =
    await apiRequest(
      `/schools/${encodeURIComponent(schoolId)}/courses`,
      {},
      true
    );

  if (!res) {
    return [];
  }

  const result =
    await res.json();

  if (
    !res.ok ||
    !result.success
  ) {
    throw new Error(
      result.error ||
      "Failed to load school courses."
    );
  }

  return result.courses || [];
}
async function getCourseSchools(
  courseId,
  limit = 20
) {
  const params =
    new URLSearchParams();

  params.set(
    "limit",
    limit
  );

  const res =
    await apiRequest(
      `/courses/${encodeURIComponent(courseId)}/schools?${params.toString()}`,
      {},
      true
    );

  if (!res) {
    return [];
  }

  const result =
    await res.json();

  if (
    !res.ok ||
    !result.success
  ) {
    throw new Error(
      result.error ||
      "Failed to load schools offering this course."
    );
  }

  return result.schools || [];
}


