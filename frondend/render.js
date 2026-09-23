function renderSchools(
  schools,
  containerId = "schoolList"
) {
  const container =
    document.getElementById(
      containerId
    );

  if (!container) {
    return;
  }

  if (!schools.length) {
    container.innerHTML =
      `<div class="service-loading">
        No schools available.
      </div>`;

    return;
  }

  container.innerHTML = "";

  schools.forEach(
    school => {
      const card =
        document.createElement(
          "div"
        );

      card.className =
        "school-card";

      card.addEventListener(
        "click",
        () => {
          openSchool(
            school.id
          );
        }
      );

      card.innerHTML = `
        <div class="school-card-content">
          <h3 class="school-card-name">
            ${school.name}
          </h3>

          ${
            school.short_name
              ? `
                <p class="school-card-short-name">
                  ${school.short_name}
                </p>
              `
              : ""
          }

          <p class="school-card-location">
            ${
              [
                school.city,
                school.state
              ]
                .filter(Boolean)
                .join(", ") ||
              "Location not available."
            }
          </p>

          <div class="school-card-meta">
            <span>
              ${school.type}
            </span>

            <span>
              ${school.ownership}
            </span>
          </div>
        </div>
      `;

      container.appendChild(
        card
      );
    }
  );
}

function renderSchool(
  school,
  courses = []
) {
  const container =
    document.getElementById(
      "schoolContent"
    );

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="school-detail">
      <h1 class="school-detail-title">
        ${school.name}
      </h1>

      ${
        school.short_name
          ? `
            <p class="school-detail-short-name">
              ${school.short_name}
            </p>
          `
          : ""
      }

      <div class="school-detail-section">
        <h3>School Information</h3>

        <p>
          <strong>Type:</strong>
          ${school.type || "Not available"}
        </p>

        <p>
          <strong>Ownership:</strong>
          ${school.ownership || "Not available"}
        </p>

        <p>
          <strong>Location:</strong>
          ${
            [
              school.city,
              school.state
            ]
              .filter(Boolean)
              .join(", ") ||
            "Not available"
          }
        </p>

        ${
          school.address
            ? `
              <p>
                <strong>Address:</strong>
                ${school.address}
              </p>
            `
            : ""
        }
      </div>

      ${
        school.description
          ? `
            <div class="school-detail-section">
              <h3>About</h3>

              <p>
                ${school.description}
              </p>
            </div>
          `
          : ""
      }

      <div class="school-detail-section">
        <h3>Courses</h3>

        ${
          courses.length
            ? `
              <div class="school-course-list">
                ${courses.map(
                  course => `
                    <button
                      type="button"
                      class="school-course-card"
                      data-course-id="${course.id}"
                    >
                      <span>
                        ${course.name}
                      </span>

                      <strong>
                        ₦${Number(
                          course.fee
                        ).toLocaleString()}
                      </strong>
                    </button>
                  `
                ).join("")}
              </div>
            `
            : `
              <p>
                No courses available.
              </p>
            `
        }
      </div>

      ${
        school.website_url
          ? `
            <div class="school-detail-section">
              <h3>Official Website</h3>

              <a
                href="${school.website_url}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Official Website
              </a>
            </div>
          `
          : ""
      }
    </div>
  `;

  container
    .querySelectorAll(
      ".school-course-card"
    )
    .forEach(
      button => {
        button.addEventListener(
          "click",
          async () => {
            const courseId =
              button.dataset.courseId;

            const course =
              await getSchoolCourse(
                school.id,
                courseId
              );

            if (!course) {
              return;
            }

            renderSchoolCourse(
              school,
              course,
              courses
            );
          }
        );
      }
    );
}

function renderCourses(
  courses,
  containerId = "searchResults"
) {
  const container =
    document.getElementById(
      containerId
    );

  if (!container) {
    return;
  }

  if (!courses.length) {
    container.innerHTML =
      `<div class="service-loading">
        No courses found.
      </div>`;

    return;
  }

  container.innerHTML = "";

  courses.forEach(
    course => {
      const card =
        document.createElement(
          "div"
        );

      card.className =
        "course-card";

      card.innerHTML = `
        <div class="course-card-content">
          <h3 class="course-card-name">
            ${course.name}
          </h3>

          ${
            course.description
              ? `
                <p class="course-card-description">
                  ${course.description}
                </p>
              `
              : ""
          }
        </div>
      `;

      container.appendChild(
        card
      );
    }
  );
}

function renderSchoolCourse(
  school,
  course,
  courses
) {
  const container =
    document.getElementById(
      "schoolContent"
    );
  
  if (!container) {
    return;
  }
  
  const generalRequirements =
    course.requirements || {};
  
  const schoolRequirements =
    course.school_requirements || {};
  
  container.innerHTML = `
    <div class="school-detail">
      <button
        type="button"
        class="course-back-button"
        id="courseDetailBackButton"
      >
        ← ${school.name}
      </button>

      <div class="school-detail-section">
        <h1>
          ${course.name}
        </h1>

        ${
          course.description
            ? `
              <p>
                ${course.description}
              </p>
            `
            : ""
        }
      </div>

      <div class="school-detail-section">
        <h3>School</h3>

        <p>
          ${school.name}
        </p>
      </div>

      <div class="school-detail-section">
        <h3>Fee</h3>

        <p>
          ${
            course.fee !== null &&
            course.fee !== undefined
              ? `₦${Number(
                  course.fee
                ).toLocaleString()}`
              : "Not available"
          }
        </p>
      </div>

      ${
        generalRequirements.utme?.length ||
        generalRequirements.o_level_required?.length ||
        generalRequirements.o_level_other?.length
          ? `
            <div class="school-detail-section">
              <h3>General Requirements</h3>

              ${
                generalRequirements.utme?.length
                  ? `
                    <div>
                      <h4>UTME Subjects</h4>

                      <ul>
                        ${generalRequirements.utme.map(
                          subject => `
                            <li>
                              ${subject}
                            </li>
                          `
                        ).join("")}
                      </ul>
                    </div>
                  `
                  : ""
              }

              ${
                generalRequirements.o_level_required?.length
                  ? `
                    <div>
                      <h4>Required O'Level Subjects</h4>

                      <ul>
                        ${generalRequirements.o_level_required.map(
                          subject => `
                            <li>
                              ${subject}
                            </li>
                          `
                        ).join("")}
                      </ul>
                    </div>
                  `
                  : ""
              }

              ${
                generalRequirements.o_level_other?.length
                  ? `
                    <div>
                      <h4>Other Relevant O'Level Subjects</h4>

                      <ul>
                        ${generalRequirements.o_level_other.map(
                          subject => `
                            <li>
                              ${subject}
                            </li>
                          `
                        ).join("")}
                      </ul>
                    </div>
                  `
                  : ""
              }
            </div>
          `
          : ""
      }

      ${
        schoolRequirements.additional_subjects?.length ||
        schoolRequirements.notes
          ? `
            <div class="school-detail-section">
              <h3>School Requirements</h3>

              ${
                schoolRequirements.additional_subjects?.length
                  ? `
                    <div>
                      <h4>Additional Subjects</h4>

                      <ul>
                        ${schoolRequirements.additional_subjects.map(
                          subject => `
                            <li>
                              ${subject}
                            </li>
                          `
                        ).join("")}
                      </ul>
                    </div>
                  `
                  : ""
              }

              ${
                schoolRequirements.notes
                  ? `
                    <div>
                      <h4>Notes</h4>

                      <p>
                        ${schoolRequirements.notes}
                      </p>
                    </div>
                  `
                  : ""
              }
            </div>
          `
          : ""
      }
    </div>
  `;
  
  document
    .getElementById(
      "courseDetailBackButton"
    )
    .addEventListener(
      "click",
      () => {
        renderSchool(
          school,
          courses
        );
      }
    );
}
