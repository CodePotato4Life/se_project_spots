import "../pages/index.css";
import { enableValidation, settings, disableButton } from "../scripts/validation.js";
import Api from "../utils/Api.js";
import { setButtonText } from "../utils/helpers.js";

/* ---------------- API ---------------- */

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "446ffb78-1e34-42ed-9af6-744f9672e281",
    "Content-Type": "application/json",
  },
});

let currentUserId;

/* ---------------- DOM ---------------- */

const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector("#profileAvatar");

const cardsList = document.querySelector(".cards__list");
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");

/* ---------------- Modals ---------------- */

const editProfileModal = document.querySelector("#edit-profile-modal");
const newPostModal = document.querySelector("#new-post-modal");
const avatarModal = document.querySelector("#avatar-modal");
const deleteModal = document.querySelector("#delete-modal");
const previewModal = document.querySelector("#preview-modal");

/* ---------------- Forms & Inputs ---------------- */

const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector("#profile-name-input");
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const newPostForm = newPostModal.querySelector(".modal__form");
const newPostCaptionInput = newPostModal.querySelector("#card-caption-input");
const newPostImageInput = newPostModal.querySelector("#card-image-input");
const newPostSubmitBtn = newPostModal.querySelector(".modal__submit-btn");

const avatarForm = avatarModal.querySelector(".modal__form");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

/* ---------------- Buttons ---------------- */

const editProfileBtn = document.querySelector(".profile__edit-btn");
const newPostBtn = document.querySelector(".profile__add-btn");
const editAvatarBtn = document.querySelector(".profile__avatar-btn");
const cancelBtn = document.querySelector(".modal__cancel-btn");

/* ---------------- Preview ---------------- */

const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

/* ---------------- Modal Helpers ---------------- */

function closeOnEscape(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");
    if (openedModal) closeModal(openedModal);
  }
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", closeOnEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", closeOnEscape);
}

/* ---------------- Cards ---------------- */

function handleImageClick(data) {
  previewImageEl.src = data.link;
  previewImageEl.alt = data.name;
  previewCaptionEl.textContent = data.name;
  openModal(previewModal);
}

function handleLike(evt, cardId) {
  const likeBtn = evt.currentTarget;
  const currentlyLiked = likeBtn.classList.contains("card__like-btn_active");

  api.changeLikeCardStatus(cardId, !currentlyLiked)
    .then(updatedCard => {
      likeBtn.classList.toggle("card__like-btn_active", updatedCard.isLiked);
    })
    .catch(console.error);
}


let selectedCard = null;
let selectedCardId = null;

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-btn");
  const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  if (data.isLiked) {
    cardLikeBtnEl.classList.add("card__like-btn_active");
  }

  cardLikeBtnEl.addEventListener("click", (evt) => handleLike(evt, data._id));
  cardDeleteBtnEl.addEventListener("click", () => handleDeleteCard(cardElement, data._id));
  cardImageEl.addEventListener("click", () => handleImageClick(data));

  return cardElement;
}


/* ---------------- Submits ---------------- */

function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;

  setButtonText(submitBtn, true);

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => setButtonText(submitBtn, false));
}

function handleNewPostSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;

  setButtonText(submitBtn, true);

  api
    .addCard({
      name: newPostCaptionInput.value,
      link: newPostImageInput.value,
    })
    .then((data) => {
      cardsList.prepend(getCardElement(data));
      evt.target.reset();
      disableButton(newPostSubmitBtn, settings);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => setButtonText(submitBtn, false));
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;

  setButtonText(submitBtn, true);

  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      profileAvatarEl.src = data.avatar;
      evt.target.reset();
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => setButtonText(submitBtn, false));
}

/* ---------------- Delete Confirm ---------------- */

deleteModal
  .querySelector(".modal__submit-btn")
  .addEventListener("click", (evt) => {
    const submitBtn = evt.currentTarget;
    setButtonText(submitBtn, true, "Delete", "Deleting...");

    api
      .deleteCard(selectedCardId)
      .then(() => {
        selectedCard.remove();
        closeModal(deleteModal);
        selectedCard = null;
        selectedCardId = null;
      })
      .catch(console.error)
      .finally(() => setButtonText(submitBtn, false, "Delete"));
  });

/* ---------------- Event Listeners ---------------- */

editProfileBtn.addEventListener("click", () => {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  openModal(editProfileModal);
});

cancelBtn.addEventListener("click", () => closeModal(deleteModal));
newPostBtn.addEventListener("click", () => openModal(newPostModal));
editAvatarBtn.addEventListener("click", () => openModal(avatarModal));

editProfileForm.addEventListener("submit", handleEditProfileSubmit);
newPostForm.addEventListener("submit", handleNewPostSubmit);
avatarForm.addEventListener("submit", handleAvatarSubmit);

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (
      evt.target.classList.contains("modal") ||
      evt.target.classList.contains("modal__close-btn")
    ) {
      closeModal(modal);
    }
  });
});

/* ---------------- Init ---------------- */

api
  .getUserInfo()
  .then((user) => {
    currentUserId = user._id;
    profileNameEl.textContent = user.name;
    profileDescriptionEl.textContent = user.about;
    profileAvatarEl.src = user.avatar;
    return api.getInitialCards();
  })
  .then((cards) => {
    cards.forEach((card) => cardsList.append(getCardElement(card)));
  })
  .catch(console.error);

enableValidation(settings);
