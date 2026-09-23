async function loadHome() {
  try {
    const schools =
      await getSchools();

    renderSchools(
      schools
    );
  } catch (error) {
    const container =
      document.getElementById(
        "schoolList"
      );

    if (!container) {
      return;
    }

    container.innerHTML =
      `<div class="service-loading">
        ${error.message}
      </div>`;
  }
}

document
  .getElementById("schoolSearchButton")
  .addEventListener(
    "click",
    async () => {
      const search =
        document
        .getElementById(
          "schoolSearchInput"
        )
        .value
        .trim();

      if (!search) {
        return;
      }

      const resultsSection =
        document.getElementById(
          "searchResultsSection"
        );

      const results =
        document.getElementById(
          "searchResults"
        );

      const title =
        document.getElementById(
          "searchResultsTitle"
        );

      title.textContent =
        `Schools for "${search}"`;

      resultsSection.style.display =
        "block";

      document
        .getElementById(
          "popularSchoolsSection"
        )
        .style.display =
        "none";

      document
        .getElementById(
          "courseSearchSection"
        )
        .style.display =
        "none";

      results.innerHTML =
        `<div class="service-loading">
          Searching...
        </div>`;

      try {
        const schools =
          await searchSchools(
            search
          );

        if (!schools.length) {
          results.innerHTML =
            `<div class="service-loading">
              No schools found.
            </div>`;

          return;
        }

        renderSchools(
          schools,
          "searchResults"
        );

      } catch (error) {
        results.innerHTML =
          `<div class="service-loading">
            ${error.message}
          </div>`;
      }
    }
  );

document
  .getElementById(
    "backToHomeButton"
  )
  .addEventListener(
    "click",
    () => {
      document
        .getElementById(
          "searchResultsSection"
        )
        .style.display =
        "none";

      document
        .getElementById(
          "popularSchoolsSection"
        )
        .style.display =
        "block";

      document
        .getElementById(
          "courseSearchSection"
        )
        .style.display =
        "block";

      document
        .getElementById(
          "schoolSearchInput"
        )
        .value = "";

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  );

document
  .getElementById(
    "schoolSearchInput"
  )
  .addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Enter"
      ) {
        event.preventDefault();

        document
          .getElementById(
            "schoolSearchInput"
          )
          .blur();

        document
          .getElementById(
            "schoolSearchButton"
          )
          .click();
      }
    }
  );

document
  .getElementById(
    "courseSearchButton"
  )
  .addEventListener(
    "click",
    async () => {
      const search =
        document
        .getElementById(
          "courseSearchInput"
        )
        .value
        .trim();
      
      if (!search) {
        return;
      }
      
      const resultsSection =
        document.getElementById(
          "searchResultsSection"
        );
      
      const results =
        document.getElementById(
          "searchResults"
        );
      
      const title =
        document.getElementById(
          "searchResultsTitle"
        );
      
      title.textContent =
        `Schools offering "${search}"`;
      
      resultsSection.style.display =
        "block";
      
      document
        .getElementById(
          "popularSchoolsSection"
        )
        .style.display =
        "none";
      
      document
        .getElementById(
          "courseSearchSection"
        )
        .style.display =
        "none";
      
      results.innerHTML =
        `<div class="service-loading">
          Searching...
        </div>`;
      
      try {
        const courses =
          await getCourses(
            search,
            10
          );
        
        if (!courses.length) {
          results.innerHTML =
            `<div class="service-loading">
              No course found.
            </div>`;
          
          return;
        }
        
        const course =
          courses[0];
        
        const schools =
          await getCourseSchools(
            course.id
          );
        
        if (!schools.length) {
          results.innerHTML =
            `<div class="service-loading">
              No schools found offering ${course.name}.
            </div>`;
          
          return;
        }
        
        renderSchools(
          schools,
          "searchResults"
        );
        
      } catch (error) {
        results.innerHTML =
          `<div class="service-loading">
            ${error.message}
          </div>`;
      }
    }
  );

document
  .getElementById(
    "courseSearchInput"
  )
  .addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Enter"
      ) {
        event.preventDefault();

        document
          .getElementById(
            "courseSearchInput"
          )
          .blur();

        document
          .getElementById(
            "courseSearchButton"
          )
          .click();
      }
    }
  );

async function openSchool(
  schoolId
) {
  const homePage =
    document.getElementById(
      "homePage"
    );
  
  const schoolPage =
    document.getElementById(
      "schoolPage"
    );
  
  const content =
    document.getElementById(
      "schoolContent"
    );
  
  if (
    !homePage ||
    !schoolPage ||
    !content
  ) {
    return;
  }
  
  homePage.style.display =
    "none";
  
  schoolPage.style.display =
    "block";
  
  content.innerHTML =
    `<div class="service-loading">
      Loading school...
    </div>`;
  
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
  
  try {
    const [
      school,
      courses
    ] = await Promise.all([
      getSchool(schoolId),
      getSchoolCourses(schoolId)
    ]);
    
    if (!school) {
      content.innerHTML =
        `<div class="service-loading">
          School not found.
        </div>`;
      
      return;
    }
    
    renderSchool(
      school,
      courses
    );
    
  } catch (error) {
    content.innerHTML =
      `<div class="service-loading">
        ${error.message}
      </div>`;
  }
}

document
  .getElementById(
    "schoolBackButton"
  )
  .addEventListener(
    "click",
    () => {
      document
        .getElementById(
          "schoolPage"
        )
        .style.display =
        "none";

      document
        .getElementById(
          "homePage"
        )
        .style.display =
        "block";

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  );

document
  .querySelectorAll(
    ".search-suggestion"
  )
  .forEach(
    button => {
      button.addEventListener(
        "click",
        () => {
          const search =
            button.dataset.search;

          const input =
            document.getElementById(
              "schoolSearchInput"
            );

          if (!input) {
            return;
          }

          input.value =
            search;

          document
            .getElementById(
              "schoolSearchButton"
            )
            .click();
        }
      );
    }
  );

