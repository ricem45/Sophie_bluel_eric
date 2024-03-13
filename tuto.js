// Fonction pour récupérer des données depuis une API de manière asynchrone
async function fetchAPI(url, options = {}) {
  try {
    // Effectue la requête HTTP à l'URL fournie avec les options données
    const response = await fetch(url, options);
    // Si la réponse est ok, convertit et retourne le corps de la réponse en JSON
    return response.ok ? await response.json() : null;
  } catch (error) {
    // Affiche l'erreur dans la console si la requête échoue
    console.error("Une erreur est survenue", error);
    return null;
  }
}

// Fonction pour créer un élément HTML avec du texte à l'intérieur
function createElemWithText(tag, text) {
  const elem = document.createElement(tag); // Crée l'élément HTML
  elem.innerText = text; // Définit le texte de l'élément
  return elem; // Retourne l'élément créé
}

// Fonction pour créer une figure (élément <figure>) avec une image et une légende
function createFigure({ id, imageUrl, title }) {
  const figure = document.createElement("figure");
  figure.dataset.id = id; // Stocke l'ID dans l'attribut data-id de la figure

  const img = document.createElement("img"); // Crée l'élément image
  img.src = imageUrl; // Définit l'URL de l'image

  const caption = createElemWithText("figcaption", title); // Crée la légende

  figure.append(img, caption); // Ajoute l'image et la légende à la figure
  return figure; // Retourne la figure créée
}

// Fonction pour afficher les travaux dans un conteneur
function displayWorks(works, container) {
  container.innerHTML = ""; // Vide le conteneur
  works.forEach((work) => container.appendChild(createFigure(work))); // Crée et ajoute chaque travail au conteneur
}

// Fonction pour configurer et ajouter des boutons de filtre basés sur les catégories des travaux
function setupButtons(works, filterContainer, displayContainer) {
  // Crée un bouton qui permet d'afficher tous les travaux
  const btnAll = createElemWithText("button", "Tous");
  // Ajoute un écouteur d'événement sur le bouton pour afficher tous les travaux lorsqu'il est cliqué
  btnAll.addEventListener("click", () => displayWorks(works, displayContainer));
  // Ajoute le bouton au conteneur de filtres
  filterContainer.appendChild(btnAll);

  // Détermine les catégories uniques parmi tous les travaux pour éviter les doublons
  const uniqueCategories = [
    ...new Set(works.map((work) => work.category.name)),
  ];

  // Pour chaque catégorie unique trouvée, crée un nouveau bouton de filtre
  uniqueCategories.forEach((category) => {
    // Crée un bouton avec le nom de la catégorie
    const btn = createElemWithText("button", category);
    // Ajoute un écouteur d'événement sur le bouton pour filtrer et afficher les travaux de cette catégorie lorsqu'il est cliqué
    btn.addEventListener("click", () => {
      // Filtre les travaux pour ne garder que ceux qui appartiennent à la catégorie cliquée
      const filteredWorks = works.filter(
        (work) => work.category.name === category
      );
      // Affiche les travaux filtrés dans le conteneur d'affichage
      displayWorks(filteredWorks, displayContainer);
    });
    // Ajoute le bouton de catégorie au conteneur de filtres
    filterContainer.appendChild(btn);
  });
}
// Explications supplémentaires :

// works : un tableau contenant les données de tous les travaux, où chaque travail a une catégorie.
// filterContainer : l'élément DOM (Document Object Model) dans lequel les boutons de filtre seront ajoutés. Cela permet à l'utilisateur de choisir les travaux à afficher en fonction de la catégorie.
// displayContainer : l'élément DOM où les travaux filtrés seront affichés.
// createElemWithText : une fonction qui crée un élément HTML (dans ce cas, un bouton) et définit son texte. Cette fonction est appelée pour créer le bouton "Tous" et les boutons pour chaque catégorie unique.
// displayWorks : une fonction appelée pour afficher les travaux dans le displayContainer. Elle prend en compte le filtre appliqué par les boutons de catégorie.
// Ce code utilise des fonctions d'ordre supérieur comme .map(), .filter(), et .forEach() pour travailler avec des tableaux, ainsi que l'utilisation de Set pour filtrer les valeurs uniques, ce qui sont des concepts importants en JavaScript.


// Initialisation
async function recupererTousMesProjets() {
  console.log("Page entièrement chargée");

  const works = await fetchAPI("http://localhost:5678/api/works");
  const sectionProjet = document.querySelector(".projets");
 if (works && sectionProjet)
  displayWorks(works, sectionProjet);

  const filtresDiv = document.querySelector(".filtres");
  if (works && filtresDiv) setupButtons(works, filtresDiv, sectionProjet);
}
recupererTousMesProjets();

// LOGIN

// Poste des données à l'API
const postToAPI = async (url, body) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { data: await response.json(), status: response.status };
  } catch (error) {
    console.error("Une erreur est survenue", error);
    return null;
  }
};

// Cette fonction est appelée lors de la soumission du formulaire de connexion
async function handleFormSubmission(event) {
  // Empêche le comportement par défaut du formulaire (rechargement de la page)
  event.preventDefault();

  // Récupère les valeurs saisies par l'utilisateur dans les champs du formulaire
  const email = document.querySelector("#login-email").value;
  const password = document.querySelector("#login-password").value;

  // Envoie une requête asynchrone à l'API pour tenter de connecter l'utilisateur
  const response = await postToAPI("http://localhost:5678/api/users/login", {
    email,
    password,
  });

  // Si la réponse est positive (statut 200), stocke les informations de l'utilisateur et redirige vers la page d'accueil
  if (response && response.status === 200) {
    console.log("connexion utilisateur réussie");
    // Stocke l'identifiant de l'utilisateur et le token dans le stockage local du navigateur
    localStorage.setItem("user", JSON.stringify(response.data.userId));
    localStorage.setItem("token", response.data.token);
    // Redirige l'utilisateur vers la page d'accueil
    location.href = "index.html";
  } else {
    // Si les identifiants sont incorrects, affiche un message d'erreur
    document.getElementById("error-message").textContent =
      "Identifiant ou mot de passe incorrect";
  }
}
  
// Sélectionne le formulaire de connexion dans le DOM
const form = document.getElementById("login");
// Si le formulaire existe, lui ajoute un écouteur d'événements pour gérer sa soumission
if (form) {
  form.addEventListener("submit", handleFormSubmission);
}

// Fonction appelée pour déconnecter l'utilisateur
const handleLogout = () => {
  // Supprime les informations de l'utilisateur et le token d'authentification du stockage local
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  // Recharge la page pour refléter l'état déconnecté de l'utilisateur
  location.reload();
  // Réinitialise les champs du formulaire de connexion pour effacer les entrées précédentes
  const emailElem = document.getElementById("login-email");
  const passwordElem = document.getElementById("login-password");
  if (emailElem && passwordElem) {
    emailElem.value = "";
    passwordElem.value = "";
  }
};

// Vérifie si un token d'authentification est présent et ajuste l'interface en conséquence
function checkTokenLogin() {
  // Récupère le token d'authentification du stockage local
  const tokenAuth = localStorage.getItem("token");
  console.log(tokenAuth);
  // Sélectionne différents éléments de l'interface
  const loginLink = document.getElementById("login-link");
  const adminBar = document.getElementById("admin-bar");
  const allFilterBtn = document.querySelector(".filtres");
  const modifierBtn = document.getElementById("add-project-btn");

  // Si un token est présent, ajuste l'interface pour un utilisateur connecté
  if (tokenAuth) {
    loginLink.textContent = "logout"; // Change le texte du lien de connexion en "logout"
    // Rend visible la barre d'administration et le bouton de modification, et cache le bouton de filtre
    if (adminBar) adminBar.classList.remove("hidden");
    if (allFilterBtn) allFilterBtn.classList.add("hidden");
    if (modifierBtn) modifierBtn.classList.remove("hidden");
    // Ajoute un écouteur d'événement pour gérer la déconnexion
    loginLink.addEventListener("click", handleLogout);
  } else {
    // Ajuste l'interface pour un utilisateur non connecté
    loginLink.textContent = "login"; // Garde ou remet le texte du lien en "login"
    // Cache la barre d'administration et le bouton de modification
    if (adminBar) adminBar.classList.add("hidden");
    if (modifierBtn) modifierBtn.parentNode.removeChild(modifierBtn);
  }
}
 checkTokenLogin()

//Fonction pour afficher ou masquer la modale
function toggleModal(isVisible) {
  const editModal = document.getElementById("edit-modal");
  console.log(editModal);

  if (editModal) {
    // Ajoute ou retire la classe "hidden" en fonction de l'argument isVisible
    editModal.classList.toggle("hidden", !isVisible);
  }
}

function openModal() {
  // Sélectionne tous les boutons qui ouvrent la modale
  const allEditBtn = document.querySelectorAll(".open-modal");

  // Pour chaque bouton, ajoute un écouteur d'événement qui ouvre la modale
  allEditBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleModal(true); // Affiche la modale
      
      // Clone le contenu existant des projets pour l'afficher dans la modale 
      const existingProjects = document
      .querySelector(".projets")
      .cloneNode(true);
      const modalProjects = document.getElementById("existing-projects");
      modalProjects.innerHTML = ""; // Vide le contenu actuel
      // Pour chaque image dans les projets clonés, crée un conteneur et l'ajoute à la modale
      existingProjects.querySelectorAll("img").forEach((img) => {
        const imgContainer = document.createElement("div");
        imgContainer.setAttribute("class", "img-container");
        imgContainer.setAttribute("data-id", img.closest("figure").dataset.id);
        imgContainer.innerHTML = `${img.outerHTML}<button class="delete-icon"><i class="fa-solid fa-trash-can"></i></button>`;
        modalProjects.appendChild(imgContainer);
      });
    });
  });
}
openModal()

const closeModal = () => {
  // Sélectionne les boutons de fermeture de la modale
  const closeModalButtons = document.querySelectorAll(
    "#close-modal, #close-modal-form"
  );
  // Ajoute un écouteur d'événement sur chaque bouton pour fermer la modale
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => toggleModal(false));
  });
  const editModal = document.getElementById("edit-modal");
  // Ferme la modale si l'utilisateur clique en dehors du contenu de la modale
  if (editModal) {
    editModal.addEventListener("click", (event) => {
      const modalContent = document.querySelector(".modal-content");
     const modalContentForm = document.querySelector(".modal-content-form");
      if (
        !modalContent.contains(event.target)
        &&
        !modalContentForm.contains(event.target)
      ) {
        toggleModal(false);
      }
    });
  }
};
closeModal()


const openAddPhotoModal = () => {
  const addPhotoButton = document.getElementById("add-photo-form");
  if (addPhotoButton) {
    addPhotoButton.addEventListener("click", () => {
      const modalContent = document.querySelector(".modal-content");
      const modalContentForm = document.querySelector(".modal-content-form");
      modalContent.classList.add("hidden");
      modalContentForm.classList.remove("hidden");
    });
  }
};
openAddPhotoModal()

const backFormModal = () => {
  const backFormModalButton = document.getElementById("back-form-modal");
  if (backFormModalButton) {
    backFormModalButton.addEventListener("click", () => {
      const modalContent = document.querySelector(".modal-content");
      const modalContentForm = document.querySelector(".modal-content-form");
      modalContent.classList.remove("hide");
      modalContentForm.classList.add("hide");
    });
  }
};

// backFormModal()

// Supprime un projet du DOM
const deleteProjectFromDOM = (projectId) => {
  // Sélectionne l'élément du projet dans le modal d'édition par son data-id
  const modalProject = document.querySelector(
    `#existing-projects .img-container[data-id="${projectId}"]`
  );

  // Sélectionne l'élément du projet dans la galerie principale par son data-id
  const galleryProject = document.querySelector(
    `.projets figure[data-id="${projectId}"]`
  );

  // Si l'élément existe dans le modal, le supprime du DOM
  if (modalProject) {
    modalProject.remove();
  }

  // Si l'élément existe dans la galerie, le supprime du DOM
  if (galleryProject) {
    galleryProject.remove();
  }
};

// Attache l'écouteur d'événements pour supprimer des projets
const deleteWorks = () => {
  // Sélectionne l'élément conteneur pour les projets existants
  const deleteExistingProjects = document.getElementById("existing-projects");

  // Si l'élément existe, attache un écouteur d'événements de clic
  if (deleteExistingProjects) {
    deleteExistingProjects.addEventListener("click", async function (event) {
      // Empêche le comportement par défaut et la propagation de l'événement
      event.preventDefault();
      event.stopPropagation();
      // Trouve l'élément img-container le plus proche du clic, s'il existe
      const imgContainer = event.target.closest(".img-container");
      // Vérifie si le clic a été fait sur une icône de suppression
      const deleteIcon = event.target.closest(".delete-icon");

      // Si un icône de suppression a été cliqué dans un conteneur d'image
      if (deleteIcon && imgContainer) {
        // Récupère l'ID du projet à partir de l'attribut data-id
        const projectId = imgContainer.dataset.id;
        // Récupère le token d'authentification stocké localement
        const token = localStorage.getItem("token");

        // Effectue une requête DELETE au serveur pour supprimer le projet
        const response = await fetch(
          `http://localhost:5678/api/works/${projectId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Si la requête réussit, supprime le projet du DOM et affiche un message
        if (response.ok) {
          deleteProjectFromDOM(projectId);
          console.log("Projet supprimé avec succès!");
        }
      }
    });
  }
};
deleteWorks();
// Ajoute un projet au DOM
const addProjectToDOM = (project) => {
  const newFigure = createFigure(project);
  const sectionProjet = document.querySelector(".projets");
  sectionProjet.appendChild(newFigure);

  const imgContainer = document.createElement("div");
  imgContainer.setAttribute("class", "img-container");
  imgContainer.setAttribute("data-id", project.id);
  imgContainer.innerHTML = `${
    newFigure.querySelector("img").outerHTML
  }<button class="delete-icon"><i class="fa-solid fa-trash-can"></i></button>`;

  const modalProjects = document.getElementById("existing-projects");
  modalProjects.appendChild(imgContainer);
};

// FORMULAIRE D'AJOUT DE PROJET

// Validation et envoi du formulaire d'ajout de projet
const formPostProject = document.querySelector("#add-photo-form");
if (formPostProject) {
  formPostProject.addEventListener("submit", async function (event) {
    event.preventDefault();

    const imageUpload = document.getElementById("image").files[0];
    const projectTitle = document.getElementById("title").value;
    const projectCategory = document.getElementById("project-category").value;

    if (!imageUpload || !projectTitle || !projectCategory) {
      document.getElementById("form-error-message").classList.remove("hidden");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageUpload);
    formData.append("title", projectTitle);
    formData.append("category", projectCategory);

    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const successMessage = document.getElementById("form-success-message");
      successMessage.classList.remove("hidden");
      setTimeout(function () {
        successMessage.classList.add("hidden");
        toggleModal(false);
      }, 1000);
      const newProject = await response.json();
      addProjectToDOM(newProject);
    } else {
      alert("Une erreur s'est produite. Veuillez réessayer.");
    }
  });
}

// Téléchargement de l'image
const uploadImage = () => {
  const imageUploadButton = document.getElementById("image-upload-btn");
  const imageInputElement = document.getElementById("image");
  if (imageUploadButton && imageInputElement) {
    imageUploadButton.addEventListener("click", (e) => {
      e.preventDefault();
      imageInputElement.click();
    });
    imageInputElement.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgElem = document.getElementById("uploaded-image");
          imgElem.src = e.target.result;
          imgElem.style.display = "block";
          document.getElementById("image-upload-icon").style.display = "none";
          document.getElementById("image-upload-btn").style.display = "none";
          document.getElementById("file-info-text").style.display = "none";
          imgElem.addEventListener("click", () => {
            imageInputElement.click();
          });
        };
        reader.readAsDataURL(file);
      }
    });
  }
};
