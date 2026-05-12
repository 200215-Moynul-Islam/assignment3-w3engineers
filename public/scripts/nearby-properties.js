const propertyContainer = document.getElementById("nearbyProperties");
const propertyFilter = document.getElementById("propertyFilter");
const FAVORITES_STORAGE_KEY = "favoritePropertyIds";

// #region Favourite section
function getFavoritePropertyIds() {
  return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)) || [];
}

function setFavoritePropertyIds(ids) {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
}

function isPropertyFavorited(propertyId) {
  return getFavoritePropertyIds().includes(propertyId);
}

function togglePropertyFavorite(propertyId) {
  let favoriteIds = getFavoritePropertyIds();

  if (favoriteIds.includes(propertyId)) {
    favoriteIds = favoriteIds.filter((id) => id !== propertyId);
  } else {
    favoriteIds.push(propertyId);
  }

  setFavoritePropertyIds(favoriteIds);
}
// #endregion

function isMobile() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function getLimit() {
  return isMobile() ? 4 : 6;
}

async function fetchProperties(type) {
  try {
    const limit = getLimit();

    const queryMap = {
      "most-popular": "most-popular=true",
      "highest-price": "highest-price=true",
      "lowest-price": "lowest-price=true",
    };

    const res = await fetch(
      `http://localhost:3000/get-property?${queryMap[type]}&limit=${limit}`
    );

    const data = await res.json();

    renderProperties(data.Result.Items);
  } catch (err) {
    console.error("Error fetching properties:", err);
  }
}

function renderProperties(items) {
  propertyContainer.innerHTML = "";

  items.forEach((item) => {
    const p = item.Property;

    const imageUrl = `https://beta.imgservice.rentbyowner.com/640x300/${p.FeatureImage}`;

    const propertyId = item.ID;
    const name = p.PropertyName || "Hotel Name Goes Here";
    const price = p.Price ?? p.CachePrice ?? 0;
    const rating = p.ReviewScore ?? 5;
    const reviews = p.Counts?.Reviews ?? 0;
    const bedroom = p.Counts?.Bedroom ?? 0;
    const bathroom = p.Counts?.Bathroom ?? 0;
    const propertyType = p.PropertyType || "Villa";
    const location = item.GeoInfo?.Display || "Location not available";

    const amenities = p.TopAmenities?.length
      ? p.TopAmenities.map((a) => a.Name).join(" • ")
      : "Air Conditioner • Bedding/Linens • Balcony/Terrace";

    const card = document.createElement("article");
    card.className = "hotel-card";

    card.innerHTML = `
      <div class="card-image">
        <img src="${imageUrl}" alt="${name}" />

        <span class="price-tag">From $${price}</span>

        <div class="card-actions">
          <button aria-label="Chat">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="white">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </button>

          <button aria-label="Location">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="white">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </button>

          <button 
            class="favorite-btn ${
              isPropertyFavorited(propertyId) ? "active" : ""
            }" 
            data-property-id="${propertyId}"
            aria-label="Toggle Favorite"
            >
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24"
                fill="${isPropertyFavorited(propertyId) ? "red" : "none"}"
                stroke="${isPropertyFavorited(propertyId) ? "red" : "white"}"
                stroke-width="2">
                <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>
            </svg>
            </button>
        </div>
      </div>

      <div class="card-content">
        <div class="card-meta-top">
          <span class="card-rating">★ ${rating} (${reviews} Reviews)</span>
          <span class="property-type">${propertyType}</span>
        </div>

        <h3 class="hotel-name">${name}</h3>

        <p class="amenity-list">
          ${amenities}
        </p>

        <p class="hotel-location">
          ${location}
        </p>

        <div class="card-footer">
          <img src="images/booking.com.png" alt="Booking" class="provider-logo" />

          <a href="${
            item.Partner?.URL || "#"
          }" class="view-btn" target="_blank">
            View Availability
          </a>
        </div>
      </div>
    `;

    propertyContainer.appendChild(card);
  });
}

// Dropdown handler
propertyFilter.addEventListener("change", (e) => {
  fetchProperties(e.target.value);
});

// Toggle Favourite
propertyContainer.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest(".favorite-btn");
  if (!favoriteButton) return;

  const propertyId = favoriteButton.dataset.propertyId;
  if (!propertyId) return;

  togglePropertyFavorite(propertyId);

  const isFavorited = isPropertyFavorited(propertyId);
  const icon = favoriteButton.querySelector("svg");

  favoriteButton.classList.toggle("active", isFavorited);
  icon.setAttribute("fill", isFavorited ? "red" : "none");
  icon.setAttribute("stroke", isFavorited ? "red" : "white");
});

// Initial Load
fetchProperties("most-popular");
