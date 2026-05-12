const aboutSection = document.querySelector(".about-container");

const toggleButtons = document.querySelectorAll(".show-more");

toggleButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;

    if (target === "about") {
      const isOpen = aboutSection.classList.toggle("about-expanded");
      btn.textContent = isOpen ? "Show less" : "Show more";
    }

    if (target === "amenities") {
      const isOpen = aboutSection.classList.toggle("amenities-expanded");
      btn.textContent = isOpen ? "Show less" : "Show more";
    }
  });
});
