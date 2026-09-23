function setActiveNav(
  activeButton
) {
  document
    .querySelectorAll(
      ".nav-button"
    )
    .forEach(
      button => {
        button.classList.remove(
          "active"
        );
      }
    );
  
  activeButton.classList.add(
    "active"
  );
}


document
  .getElementById(
    "homeNavButton"
  )
  .addEventListener(
    "click",
    () => {
      setActiveNav(
        document.getElementById(
          "homeNavButton"
        )
      );
      
      showHomePage();
      
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  );


document.getElementById("schoolsNavButton").addEventListener("click", () => {
  setActiveNav(document.getElementById("schoolsNavButton"));
  showHomePage();
  
  const schools = document.getElementById("popularSchoolsSection");
  
  if (schools) {
    schools.scrollIntoView({
      behavior: "smooth"
    });
  }
});


function showHomePage() {
  const homePage =
    document.getElementById(
      "homePage"
    );
  
  const solutionPage =
    document.getElementById(
      "solutionPage"
    );
  
  if (solutionPage) {
    solutionPage.style.display =
      "none";
  }
  
  if (homePage) {
    homePage.style.display =
      "block";
  }
}