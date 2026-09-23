let confirmCallback = null;

let selectedSchools = [];
async function openSchoolComparisonPage() {
  document
    .querySelectorAll(".page")
    .forEach(page => {
      page.style.display = "none";
    });
  const page =
    document.getElementById(
      "schoolComparisonPage"
    );
  if (!page) {
    return;
  }
  page.style.display = "block";
  renderSelectedSchools();
  clearSchoolComparisonResults();
  loadSchoolComparisonResults("");
  
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}
function closeSchoolComparisonPage() {
  const page =
    document.getElementById(
      "schoolComparisonPage"
    );
  if (!page) {
    return;
  }
  page.style.display = "none";
  const homePage =
    document.getElementById(
      "homePage"
    );
  if (homePage) {
    homePage.style.display = "block";
  }
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}
async function loadSchoolComparisonResults(
  search
) {
  const container =
    document.getElementById(
      "comparisonSchoolResults"
    );
  if (!container) {
    return;
  }
  container.innerHTML =
    `<div class="school-loading">
      Loading schools...
    </div>`;
  try {
    const schools =
      await getSchools(
        search || null
      );
    const selectedIds =
      selectedSchools.map(
        school => String(school.id)
      );
    const availableSchools =
      schools.filter(
        school =>
          !selectedIds.includes(
            String(school.id)
          )
      );
    if (!availableSchools.length) {
      container.innerHTML =
        `<div class="school-loading">
          No schools found.
        </div>`;
      return;
    }
    container.innerHTML =
      availableSchools.map(
        school => `
          <button
            type="button"
            class="comparison-school-option"
            data-school-id="${school.id}"
          >
            <div>
              <strong>
                ${school.name}
              </strong>
              ${
                school.short_name
                  ? `
                    <span>
                      ${school.short_name}
                    </span>
                  `
                  : ""
              }
            </div>
            <span>
              ${school.city || ""}
              ${
                school.state
                  ? `, ${school.state}`
                  : ""
              }
            </span>
          </button>
        `
      ).join("");
    container
      .querySelectorAll(
        ".comparison-school-option"
      )
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            const school =
              availableSchools.find(
                item =>
                  String(item.id) ===
                  String(
                    button.dataset.schoolId
                  )
              );
            if (!school) {
              return;
            }
            addSchoolToComparison(
              school
            );
            const input =
              document.getElementById(
                "comparisonSchoolSearch"
              );
            if (input) {
              input.value = "";
            }
            loadSchoolComparisonResults("");
          }
        );
      });
  } catch (error) {
    container.innerHTML =
      `<div class="school-loading">
        ${error.message}
      </div>`;
  }
}
function addSchoolToComparison(
  school
) {
  if (
    selectedSchools.some(
      item =>
        String(item.id) ===
        String(school.id)
    )
  ) {
    return;
  }
  if (selectedSchools.length >= 3) {
    return;
  }
  selectedSchools.push(
    school
  );
  renderSelectedSchools();
  updateCompareSchoolsButton();
}
function removeSchoolFromComparison(
  schoolId
) {
  selectedSchools =
    selectedSchools.filter(
      school =>
        String(school.id) !==
        String(schoolId)
    );
  renderSelectedSchools();
  updateCompareSchoolsButton();
  loadSchoolComparisonResults(
    document.getElementById(
      "comparisonSchoolSearch"
    )?.value || ""
  );
}
function renderSelectedSchools() {
  const container =
    document.getElementById(
      "selectedSchools"
    );
  if (!container) {
    return;
  }
  if (!selectedSchools.length) {
    container.innerHTML =
      `<div class="comparison-empty">
        Select at least two schools to compare.
      </div>`;
    return;
  }
  container.innerHTML =
    selectedSchools.map(
      school => `
        <div
          class="selected-school"
          data-school-id="${school.id}"
        >
          <div>
            <strong>
              ${school.name}
            </strong>
            <span>
              ${school.city || ""}
              ${
                school.state
                  ? `, ${school.state}`
                  : ""
              }
            </span>
          </div>
          <button
            type="button"
            class="remove-comparison-school"
            data-school-id="${school.id}"
            aria-label="Remove ${school.name}"
          >
            ×
          </button>
        </div>
      `
    ).join("");
  container
    .querySelectorAll(
      ".remove-comparison-school"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          removeSchoolFromComparison(
            button.dataset.schoolId
          );
        }
      );
    });
}
function updateCompareSchoolsButton() {
  const button =
    document.getElementById(
      "compareSchoolsButton"
    );
  if (!button) {
    return;
  }
  button.disabled =
    selectedSchools.length < 2;
  button.textContent =
    selectedSchools.length >= 2
      ? `Compare ${selectedSchools.length} Schools`
      : "Compare Schools";
}
function clearSchoolComparisonResults() {
  const container =
    document.getElementById(
      "schoolComparisonResult"
    );
  if (container) {
    container.innerHTML = "";
  }
}


function updateCompareSchoolsButton() {
  const button =
    document.getElementById(
      "compareSchoolsButton"
    );
  
  if (!button) {
    return;
  }
  
  button.disabled =
    selectedSchools.length < 2;
  
  button.textContent =
    selectedSchools.length >= 2 ?
    `Compare ${selectedSchools.length} Schools` :
    "Compare Schools";
  
  const searchInput =
    document.getElementById(
      "comparisonSchoolSearch"
    );
  
  if (searchInput) {
    searchInput.disabled =
      selectedSchools.length >= 3;
    
    searchInput.placeholder =
      selectedSchools.length >= 3 ?
      "Maximum of 3 schools selected" :
      "Search for a school";
  }
}

function renderSchoolComparison(
  schools
) {
  const container =
    document.getElementById(
      "schoolComparisonResult"
    );
  
  if (!container) {
    return;
  }
  
  const courseMap =
    new Map();
  
  schools.forEach(
    school => {
      school.courses.forEach(
        course => {
          const key =
            String(course.id);
          
          if (!courseMap.has(key)) {
            courseMap.set(
              key,
              course
            );
          }
        }
      );
    }
  );
  
  const courses =
    Array.from(
      courseMap.values()
    ).sort(
      (a, b) =>
      a.name.localeCompare(
        b.name
      )
    );
  
  container.innerHTML = `
    <div class="school-comparison-table-wrapper">
      <table class="school-comparison-table">
        <thead>
          <tr>
            <th>Details</th>

            ${schools.map(
              school => `
                <th>
                  ${school.name}
                </th>
              `
            ).join("")}
          </tr>
        </thead>

        <tbody>
          <tr>
            <th>Type</th>

            ${schools.map(
              school => `
                <td>
                  ${school.type || "Not available"}
                </td>
              `
            ).join("")}
          </tr>

          <tr>
            <th>Ownership</th>

            ${schools.map(
              school => `
                <td>
                  ${school.ownership || "Not available"}
                </td>
              `
            ).join("")}
          </tr>

          <tr>
            <th>Location</th>

            ${schools.map(
              school => `
                <td>
                  ${
                    [
                      school.city,
                      school.state
                    ]
                      .filter(Boolean)
                      .join(", ") ||
                    "Not available"
                  }
                </td>
              `
            ).join("")}
          </tr>

          <tr>
            <th>Courses</th>

            ${schools.map(
              school => `
                <td>
                  ${school.courses.length}
                </td>
              `
            ).join("")}
          </tr>
        </tbody>
      </table>
    </div>

    <div class="school-comparison-courses">
      <h2>Courses Offered</h2>

      <div class="school-comparison-table-wrapper">
        <table class="school-comparison-table">
          <thead>
            <tr>
              <th>Course</th>

              ${schools.map(
                school => `
                  <th>
                    ${
                      school.short_name ||
                      school.name
                    }
                  </th>
                `
              ).join("")}
            </tr>
          </thead>

          <tbody>
            ${
              courses.length
                ? courses.map(
                    course => `
                      <tr>
                        <th>
                          ${course.name}
                        </th>

                        ${schools.map(
                          school => {
                            const offered =
                              school.courses.some(
                                item =>
                                  String(
                                    item.id
                                  ) ===
                                  String(
                                    course.id
                                  )
                              );

                            return `
                              <td class="${
                                offered
                                  ? "course-available"
                                  : "course-unavailable"
                              }">
                                ${
                                  offered
                                    ? "✓"
                                    : "—"
                                }
                              </td>
                            `;
                          }
                        ).join("")}
                      </tr>
                    `
                  ).join("")
                : `
                    <tr>
                      <td colspan="${schools.length + 1}">
                        No courses available.
                      </td>
                    </tr>
                  `
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function initSchoolComparison() {
  const openButton =
    document.getElementById(
      "openSchoolComparisonButton"
    );
  
  if (openButton) {
    openButton.addEventListener(
      "click",
      openSchoolComparisonPage
    );
  }
  
  const backButton =
    document.getElementById(
      "schoolComparisonBackButton"
    );
  
  if (backButton) {
    backButton.addEventListener(
      "click",
      closeSchoolComparisonPage
    );
  }
  
  const searchInput =
    document.getElementById(
      "comparisonSchoolSearch"
    );
  
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      () => {
        loadSchoolComparisonResults(
          searchInput.value.trim()
        );
      }
    );
  }
  
  const compareButton =
    document.getElementById(
      "compareSchoolsButton"
    );
  
  if (compareButton) {
    compareButton.addEventListener(
      "click",
      compareSelectedSchools
    );
  }
  
  updateCompareSchoolsButton();
}

document.addEventListener(
  "DOMContentLoaded",
  initSchoolComparison
);
async function compareSelectedSchools() {
  if (selectedSchools.length < 2) {
    return;
  }
  const container =
    document.getElementById(
      "schoolComparisonResult"
    );
  if (!container) {
    return;
  }
  container.innerHTML =
    `<div class="school-loading">
      Loading comparison...
    </div>`;
  try {
    const comparison =
      await Promise.all(
        selectedSchools.map(
          async school => {
            const courses =
              await getSchoolCourses(
                school.id
              );
            return {
              ...school,
              courses
            };
          }
        )
      );
    renderSchoolComparison(
      comparison
    );
  } catch (error) {
    container.innerHTML =
      `<div class="school-loading">
        ${error.message}
      </div>`;
  }
}


let selectedCourses = [];

async function openCourseComparisonPage() {
  document
    .querySelectorAll(".page")
    .forEach(page => {
      page.style.display = "none";
    });

  const page =
    document.getElementById(
      "courseComparisonPage"
    );

  if (!page) {
    return;
  }

  page.style.display = "block";

  renderSelectedCourses();
  clearCourseComparisonResults();
  loadCourseComparisonResults("");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function closeCourseComparisonPage() {
  const page =
    document.getElementById(
      "courseComparisonPage"
    );

  if (!page) {
    return;
  }

  page.style.display = "none";

  const homePage =
    document.getElementById(
      "homePage"
    );

  if (homePage) {
    homePage.style.display = "block";
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

async function loadCourseComparisonResults(
  search
) {
  const container =
    document.getElementById(
      "comparisonCourseResults"
    );

  if (!container) {
    return;
  }

  container.innerHTML =
    `<div class="school-loading">
      Loading courses...
    </div>`;

  try {
    const courses =
      await getCourses(
        search || null
      );

    const selectedIds =
      selectedCourses.map(
        course => String(course.id)
      );

    const availableCourses =
      courses.filter(
        course =>
          !selectedIds.includes(
            String(course.id)
          )
      );

    if (!availableCourses.length) {
      container.innerHTML =
        `<div class="school-loading">
          No courses found.
        </div>`;
      return;
    }

    container.innerHTML =
      availableCourses.map(
        course => `
          <button
            type="button"
            class="comparison-course-option"
            data-course-id="${course.id}"
          >
            <div>
              <strong>
                ${course.name}
              </strong>

              ${
                course.slug
                  ? `
                    <span>
                      ${course.slug}
                    </span>
                  `
                  : ""
              }
            </div>
          </button>
        `
      ).join("");

    container
      .querySelectorAll(
        ".comparison-course-option"
      )
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            const course =
              availableCourses.find(
                item =>
                  String(item.id) ===
                  String(
                    button.dataset.courseId
                  )
              );

            if (!course) {
              return;
            }

            addCourseToComparison(
              course
            );

            const input =
              document.getElementById(
                "comparisonCourseSearch"
              );

            if (input) {
              input.value = "";
            }

            loadCourseComparisonResults("");
          }
        );
      });
  } catch (error) {
    container.innerHTML =
      `<div class="school-loading">
        ${error.message}
      </div>`;
  }
}

function addCourseToComparison(
  course
) {
  if (
    selectedCourses.some(
      item =>
        String(item.id) ===
        String(course.id)
    )
  ) {
    return;
  }

  if (selectedCourses.length >= 3) {
    return;
  }

  selectedCourses.push(
    course
  );

  renderSelectedCourses();
  updateCompareCoursesButton();
}

function removeCourseFromComparison(
  courseId
) {
  selectedCourses =
    selectedCourses.filter(
      course =>
        String(course.id) !==
        String(courseId)
    );

  renderSelectedCourses();
  updateCompareCoursesButton();

  loadCourseComparisonResults(
    document.getElementById(
      "comparisonCourseSearch"
    )?.value || ""
  );
}

function renderSelectedCourses() {
  const container =
    document.getElementById(
      "selectedCourses"
    );

  if (!container) {
    return;
  }

  if (!selectedCourses.length) {
    container.innerHTML =
      `<div class="course-comparison-empty">
        Select at least two courses to compare.
      </div>`;
    return;
  }

  container.innerHTML =
    selectedCourses.map(
      course => `
        <div
          class="selected-course"
          data-course-id="${course.id}"
        >
          <div>
            <strong>
              ${course.name}
            </strong>
          </div>

          <button
            type="button"
            class="remove-comparison-course"
            data-course-id="${course.id}"
            aria-label="Remove ${course.name}"
          >
            ×
          </button>
        </div>
      `
    ).join("");

  container
    .querySelectorAll(
      ".remove-comparison-course"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          removeCourseFromComparison(
            button.dataset.courseId
          );
        }
      );
    });
}

function updateCompareCoursesButton() {
  const button =
    document.getElementById(
      "compareCoursesButton"
    );

  if (!button) {
    return;
  }

  button.disabled =
    selectedCourses.length < 2;

  button.textContent =
    selectedCourses.length >= 2
      ? `Compare ${selectedCourses.length} Courses`
      : "Compare Courses";

  const searchInput =
    document.getElementById(
      "comparisonCourseSearch"
    );

  if (searchInput) {
    searchInput.disabled =
      selectedCourses.length >= 3;

    searchInput.placeholder =
      selectedCourses.length >= 3
        ? "Maximum of 3 courses selected"
        : "Search for a course";
  }
}

function clearCourseComparisonResults() {
  const container =
    document.getElementById(
      "courseComparisonResult"
    );

  if (container) {
    container.innerHTML = "";
  }
}


async function compareSelectedCourses() {
  if (selectedCourses.length < 2) {
    return;
  }
  
  const container =
    document.getElementById(
      "courseComparisonResult"
    );
  
  if (!container) {
    return;
  }
  
  container.innerHTML =
    `<div class="school-loading">
      Loading comparison...
    </div>`;
  
  try {
    const comparison =
      await Promise.all(
        selectedCourses.map(
          async course => {
            const schools =
              await getCourseSchools(
                course.id
              );
            
            return {
              ...course,
              schools
            };
          }
        )
      );
    
    renderCourseComparison(
      comparison
    );
  } catch (error) {
    container.innerHTML =
      `<div class="school-loading">
        ${error.message}
      </div>`;
  }
}

function renderCourseComparison(
  courses
) {
  const container =
    document.getElementById(
      "courseComparisonResult"
    );
  
  if (!container) {
    return;
  }
  
  container.innerHTML = `
    <div class="course-comparison-table-wrapper">
      <table class="course-comparison-table">
        <thead>
          <tr>
            <th>Details</th>

            ${courses.map(
              course => `
                <th>
                  ${course.name}
                </th>
              `
            ).join("")}
          </tr>
        </thead>

        <tbody>
          <tr>
            <th>Description</th>

            ${courses.map(
              course => `
                <td>
                  ${
                    course.description ||
                    "Not available"
                  }
                </td>
              `
            ).join("")}
          </tr>

          <tr>
            <th>Schools</th>

            ${courses.map(
              course => `
                <td>
                  ${course.schools.length}
                </td>
              `
            ).join("")}
          </tr>

          <tr>
            <th>Status</th>

            ${courses.map(
              course => `
                <td>
                  ${
                    course.status
                      ? "Available"
                      : "Unavailable"
                  }
                </td>
              `
            ).join("")}
          </tr>
        </tbody>
      </table>
    </div>

    <div class="course-comparison-schools">
      <h2>Schools Offering These Courses</h2>

      <div class="course-comparison-table-wrapper">
        <table class="course-comparison-table">
          <thead>
            <tr>
              <th>School</th>

              ${courses.map(
                course => `
                  <th>
                    ${course.name}
                  </th>
                `
              ).join("")}
            </tr>
          </thead>

          <tbody>
            ${getCourseComparisonSchools(
              courses
            )}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function getCourseComparisonSchools(
  courses
) {
  const schoolMap =
    new Map();
  
  courses.forEach(
    course => {
      course.schools.forEach(
        school => {
          const key =
            String(school.id);
          
          if (!schoolMap.has(key)) {
            schoolMap.set(
              key,
              school
            );
          }
        }
      );
    }
  );
  
  const schools =
    Array.from(
      schoolMap.values()
    ).sort(
      (a, b) =>
      a.name.localeCompare(
        b.name
      )
    );
  
  if (!schools.length) {
    return `
      <tr>
        <td colspan="${courses.length + 1}">
          No schools available.
        </td>
      </tr>
    `;
  }
  
  return schools.map(
    school => `
      <tr>
        <th>
          ${school.name}
        </th>

        ${courses.map(
          course => {
            const offered =
              course.schools.some(
                item =>
                  String(item.id) ===
                  String(school.id)
              );

            return `
              <td class="${
                offered
                  ? "course-available"
                  : "course-unavailable"
              }">
                ${
                  offered
                    ? "✓"
                    : "—"
                }
              </td>
            `;
          }
        ).join("")}
      </tr>
    `
  ).join("");
}


const openButton =
  document.getElementById(
    "openCourseComparisonButton"
  );

if (openButton) {
  openButton.addEventListener(
    "click",
    openCourseComparisonPage
  );
}

const compareButton =
  document.getElementById(
    "compareCoursesButton"
  );

if (compareButton) {
  compareButton.addEventListener(
    "click",
    compareSelectedCourses
  );
}


const courseComparisonBackButton =
  document.getElementById(
    "courseComparisonBackButton"
  );

if (courseComparisonBackButton) {
  courseComparisonBackButton.addEventListener(
    "click",
    closeCourseComparisonPage
  );
}