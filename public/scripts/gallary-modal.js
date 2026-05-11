const galleryModal = document.getElementById("galleryModal");
const galleryGrid = document.getElementById("galleryGrid");
const galleryArea = document.querySelector(".gallery-modal__content");
const currentImageIndexElement = document.getElementById(
  "galleryCurrentImageIndex",
);
const totalImageCountElement = document.getElementById(
  "galleryTotalImageCount",
);
const openBtn = document.querySelector(".view-all-btn");
const nextBtn = document.querySelector(".gallery-modal__mobile-btn--next");
const prevBtn = document.querySelector(".gallery-modal__mobile-btn--prev");

let imageList = [];
let currentImageIndex = 0;
// variable for swipe gesture
let touchStartX = 0;
let touchEndX = 0;

function isMobile() {
  return window.matchMedia("(max-width: 767px)").matches;
}

async function fetchImages() {
  try {
    const res = await fetch(`http://localhost:3000/images`);
    imageList = await res.json();
  } catch (err) {
    console.error("Failed to load gallery images", err);
  }
}

function renderImage(index) {
  galleryGrid.innerHTML = "";

  const img = document.createElement("img");
  img.src = imageList[index];
  img.alt = "Gallery image";

  img.dataset.index = index;

  galleryGrid.appendChild(img);
}

function renderAllImages() {
  galleryGrid.innerHTML = "";
  imageList.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Gallery image";
    galleryGrid.appendChild(img);
  });
}

function showNext() {
  currentImageIndex = (currentImageIndex + 1) % imageList.length;
  renderImage(currentImageIndex);
  updateImageCounterUI();
}

function showPrev() {
  currentImageIndex =
    (currentImageIndex - 1 + imageList.length) % imageList.length;
  renderImage(currentImageIndex);
  updateImageCounterUI();
}

async function openGalleryModal() {
  galleryModal.classList.add("active");
  galleryModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  await fetchImages();
  if (isMobile()) {
    renderImage(currentImageIndex);
    updateImageCounterUI();
    setTotalImageCouterUI();
  } else {
    renderAllImages();
  }
}

function closeGalleryModal() {
  galleryModal.classList.remove("active");
  galleryModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

openBtn.addEventListener("click", openGalleryModal);

galleryModal.addEventListener("click", (e) => {
  if (e.target.dataset.close === "true") closeGalleryModal();
});

nextBtn.addEventListener("click", showNext);
prevBtn.addEventListener("click", showPrev);

document
  .querySelector(".gallery-modal__close")
  .addEventListener("click", closeGalleryModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeGalleryModal();
});

// #region left and right swipe action
function handleGesture() {
  const threshold = 50; // ignore small accidental swipes

  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) < threshold) return;

  if (diff > 0) {
    // left swipe
    showNext();
  } else {
    // right swipe
    showPrev();
  }
}

function updateImageCounterUI() {
  currentImageIndexElement.innerText = currentImageIndex + 1;
}

function setTotalImageCouterUI() {
  totalImageCountElement.innerText = imageList.length;
}

galleryArea.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].clientX;
});

galleryArea.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].clientX;
  handleGesture();
});
// #endregion
