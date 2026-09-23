function showAlert(
  message,
  title = null
) {
  let modal =
    document.getElementById(
      "alertModal"
    );
  
  if (!modal) {
    modal =
      document.createElement(
        "div"
      );
    
    modal.id =
      "alertModal";
    
    modal.className =
      "modal-overlay";
    
    modal.innerHTML = `
      <div class="modal-box">

        <h3 id="alertTitle"></h3>

        <p id="alertText"></p>

        <div class="modal-actions">
          <button id="alertOkBtn">
            OK
          </button>
        </div>

      </div>
    `;
    
    document.body.appendChild(
      modal
    );
    
    document
      .getElementById(
        "alertOkBtn"
      )
      .addEventListener(
        "click",
        closeAlert
      );
  }
  
  const titleElement =
    document.getElementById(
      "alertTitle"
    );
  
  const textElement =
    document.getElementById(
      "alertText"
    );
  
  titleElement.textContent =
    title || "";
  
  titleElement.style.display =
    title ?
    "block" :
    "none";
  
  textElement.textContent =
    message || "";
  
  modal.style.display =
    "flex";
}


function closeAlert() {
  const modal =
    document.getElementById(
      "alertModal"
    );
  
  if (!modal) {
    return;
  }
  
  modal.style.display =
    "none";
}


function showConfirmModal(
  message,
  yesText = null,
  noText = null,
  title = null
) {
  const modal =
    document.getElementById(
      "confirmModal"
    );
  
  const text =
    document.getElementById(
      "confirmText"
    );
  
  const yesButton =
    document.getElementById(
      "confirmYesBtn"
    );
  
  const noButton =
    document.getElementById(
      "confirmNoBtn"
    );
  
  if (!modal || !text) {
    return Promise.resolve(false);
  }
  
  text.textContent =
    message || "";
  
  if (
    yesText !== null &&
    yesButton
  ) {
    yesButton.textContent =
      yesText;
  }
  
  if (
    noText !== null &&
    noButton
  ) {
    noButton.textContent =
      noText;
  }
  
  let titleElement =
    document.getElementById(
      "confirmTitle"
    );
  
  if (!titleElement) {
    titleElement =
      document.createElement(
        "h3"
      );
    
    titleElement.id =
      "confirmTitle";
    
    modal
      .querySelector(
        ".modal-box"
      )
      .insertBefore(
        titleElement,
        text
      );
  }
  
  titleElement.textContent =
    title || "";
  
  titleElement.style.display =
    title ?
    "block" :
    "none";
  
  modal.style.display =
    "flex";
  
  return new Promise(
    resolve => {
      confirmCallback =
        resolve;
    }
  );
}


function closeConfirmModal() {
  const modal =
    document.getElementById(
      "confirmModal"
    );
  
  if (!modal) {
    return;
  }
  
  modal.style.display =
    "none";
}


function confirmYes() {
  closeConfirmModal();
  
  if (confirmCallback) {
    confirmCallback(true);
    confirmCallback = null;
  }
}


function confirmNo() {
  closeConfirmModal();
  
  if (confirmCallback) {
    confirmCallback(false);
    confirmCallback = null;
  }
}


function showLoader() {
  const loader =
    document.getElementById(
      "loader"
    );
  
  if (!loader) {
    return;
  }
  
  loader.style.display =
    "flex";
}


function hideLoader() {
  const loader =
    document.getElementById(
      "loader"
    );
  
  if (!loader) {
    return;
  }
  
  loader.style.display =
    "none";
}



function closeMenu() {
  const menu = document.getElementById("sideMenu");
  const overlay = document.getElementById("menuOverlay");
  
  menu.classList.remove("open");
  overlay.classList.remove("active");
}


function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  const overlay = document.getElementById("menuOverlay");
  
  menu.classList.toggle("open");
  overlay.classList.toggle("active");
  
  if (menu.classList.contains("open")) {
    renderMenu();
  }
}


function handleMenuAction(action) {
  closeMenu();
  
  const actions = {
    login:goToAuthPage
  };
  
  actions[action]?.();
}

function renderMenu() {
  const menu = document.getElementById("sideMenu");
  
  if (!menu) return;
  
  menu.innerHTML = `
    <div class="menu-header">
      MENU
    </div>

    <button
      class="menu-item"
      onclick="handleMenuAction('login')">
      Login / Create account
    </button>
  `;
}

document.getElementById("menuButton").addEventListener("click", () => {
  toggleMenu();
});


function goToAuthPage() {
  const authPage = document.getElementById("authPage");
  if (!authPage) {
    return;
  }
  authPage.style.display = "block";
}

function closeAuthPage() {
  const authPage = document.getElementById("authPage");
  if (!authPage) {
    return;
  }
  authPage.style.display = "none";
}