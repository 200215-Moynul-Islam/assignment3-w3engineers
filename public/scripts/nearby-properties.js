const propertyContainer = document.getElementById("nearbyProperties");
const propertyFilter = document.getElementById("propertyFilter");
const FAVORITES_STORAGE_KEY = "favoritePropertyIds";

// #region Favourites
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

// #region Helpers
function isMobile() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function getLimit() {
  return isMobile() ? 4 : 6;
}
// #endregion

// #region Map state
let map = null;

// propertyId → { marker: AdvancedMarkerElement, card: HTMLElement }
const propertyMarkers = new Map();

const PIN_DEFAULT = {
  background: "#1a3636",
  glyphColor: "#ffffff",
  borderColor: "#1a3636",
};
const PIN_ACTIVE = {
  background: "#ff7a00",
  glyphColor: "#ffffff",
  borderColor: "#ff7a00",
};

async function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl || typeof google === "undefined") return;

  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary(
    "marker"
  );

  map = new Map(mapEl, {
    center: { lat: 18.5601, lng: -68.3725 }, // Cap Cana area
    zoom: 10,
    mapId: "nearby_properties_map",
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
  });

  // Stash constructors so renderProperties can use them
  map._AdvancedMarkerElement = AdvancedMarkerElement;
  map._PinElement = PinElement;
}

function createMarker(propertyName, position) {
  if (!map?._AdvancedMarkerElement) return null;

  const pin = new map._PinElement({
    background: PIN_DEFAULT.background,
    glyphColor: PIN_DEFAULT.glyphColor,
    borderColor: PIN_DEFAULT.borderColor,
  });

  const marker = new map._AdvancedMarkerElement({
    map,
    position,
    title: propertyName,
    content: pin.element,
  });

  marker._pin = pin; // keep reference for re-styling
  return marker;
}

function setMarkerActive(propertyId, active) {
  const entry = propertyMarkers.get(String(propertyId));
  if (!entry?.marker?._pin) return;
  const style = active ? PIN_ACTIVE : PIN_DEFAULT;
  const pin = entry.marker._pin;
  pin.background = style.background;
  pin.glyphColor = style.glyphColor;
  pin.borderColor = style.borderColor;
}

function setCardActive(propertyId, active) {
  const entry = propertyMarkers.get(String(propertyId));
  if (!entry?.card) return;
  entry.card.classList.toggle("hotel-card--active", active);
}

function clearAllActive() {
  propertyMarkers.forEach((_, id) => {
    setMarkerActive(id, false);
    setCardActive(id, false);
  });
}

function fitMapToMarkers() {
  if (!map || propertyMarkers.size === 0) return;
  const bounds = new google.maps.LatLngBounds();
  let hasPoints = false;
  propertyMarkers.forEach(({ marker }) => {
    if (marker?.position) {
      bounds.extend(marker.position);
      hasPoints = true;
    }
  });
  if (hasPoints) map.fitBounds(bounds, 60);
}
// #endregion

// #region Fetch & Render
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

  // Remove old markers from the map
  propertyMarkers.forEach(({ marker }) => {
    if (marker) marker.map = null;
  });
  propertyMarkers.clear();

  items.forEach((item) => {
    const p = item.Property;

    const propertyId = String(item.ID);
    const imageUrl = `https://beta.imgservice.rentbyowner.com/640x300/${p.FeatureImage}`;
    const name = p.PropertyName || "Hotel Name Goes Here";
    const price = p.Price ?? p.CachePrice ?? 0;
    const rating = p.ReviewScore ?? 5;
    const reviews = p.Counts?.Reviews ?? 0;
    const propertyType = p.PropertyType || "Villa";
    const location = item.GeoInfo?.Display || "Location not available";
    const amenities = p.TopAmenities?.length
      ? p.TopAmenities.map((a) => a.Name).join(" • ")
      : "Air Conditioner • Bedding/Linens • Balcony/Terrace";

    // ── Card ──────────────────────────────────────────────
    const card = document.createElement("article");
    card.className = "hotel-card";
    card.dataset.propertyId = propertyId;

    card.innerHTML = `
      <div class="card-image">
        <img src="${imageUrl}" alt="${name}" loading="lazy" />
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
        <p class="amenity-list">${amenities}</p>
        <p class="hotel-location">${location}</p>
        <div class="card-footer">
          <img src="images/booking.com.png" alt="Booking" class="provider-logo" />
          <a href="${
            item.Partner?.URL || "#"
          }" class="view-btn" target="_blank" rel="noopener noreferrer">
            View Availability
          </a>
        </div>
      </div>
    `;

    propertyContainer.appendChild(card);

    // ── Marker ────────────────────────────────────────────
    const lat = parseFloat(item.GeoInfo?.Lat);
    const lng = parseFloat(item.GeoInfo?.Lng);
    let marker = null;

    if (map && !isNaN(lat) && !isNaN(lng)) {
      marker = createMarker(name, { lat, lng });

      if (marker) {
        marker.addListener("click", () => {
          clearAllActive();
          setMarkerActive(propertyId, true);
          setCardActive(propertyId, true);
          card.scrollIntoView({ behavior: "smooth", block: "nearest" });
          map.panTo(marker.position);
        });
      }
    }

    propertyMarkers.set(propertyId, { marker, card });

    // ── Card hover ↔ marker highlight ─────────────────────
    card.addEventListener("mouseenter", () => {
      clearAllActive();
      setMarkerActive(propertyId, true);
      setCardActive(propertyId, true);
    });

    card.addEventListener("mouseleave", () => {
      setMarkerActive(propertyId, false);
      setCardActive(propertyId, false);
    });
  });

  fitMapToMarkers();
}
// #endregion

// #region Event listeners
propertyFilter.addEventListener("change", (e) => {
  fetchProperties(e.target.value);
});

propertyContainer.addEventListener("click", (event) => {
  const btn = event.target.closest(".favorite-btn");
  if (!btn) return;

  const propertyId = btn.dataset.propertyId;
  if (!propertyId) return;

  togglePropertyFavorite(propertyId);

  const isFavorited = isPropertyFavorited(propertyId);
  const icon = btn.querySelector("svg");
  btn.classList.toggle("active", isFavorited);
  icon.setAttribute("fill", isFavorited ? "red" : "none");
  icon.setAttribute("stroke", isFavorited ? "red" : "white");
});
// #endregion

// #region Bootstrap
// Called by the Google Maps script once it has loaded (see index.html callback param)
window.initGoogleMap = async function () {
  await initMap();
  fetchProperties("most-popular");
};
// #endregion
