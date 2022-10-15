// Root elements
const searchInput = document.querySelector("input");
const loadedPokemonCardsDiv = document.querySelector(".loadedPokemonCards");
const loadMoreButton = document.querySelector("button");
const loader = document.querySelector(".loader");

// Consts
const API = "https://api.pokemontcg.io/v2/cards";

let loadedCards = [];

const createCard = (cardData) => `
  <div class="card">
    <div class="info">
      <div class="cardName bold">${cardData.name}</div>
      <div class="cardNumber">Nr: ${cardData.nationalPokedexNumbers[0]}</div>
    </div>
    <img src="${cardData.images.small}" alt="Card Image">
    <div class="row">
      <span class="bold">Supertype:</span> 
      ${cardData.supertype}
    </div>
    <div class="row">
    <span class="bold">Subtype:</span>
      ${cardData.subtypes[0]}
    </div>
    <div class="row">
    <span class="bold">Rarity:</span>
      ${cardData.rarity}
    </div>
  </div>`;

const getCards = async ({ pageSize }) => {
  try {
    const searchParam = !!searchInput.value ? `name:*${searchInput.value}*` : "";
    const excludedIdParams = loadedCards.map((id) => `-id:${id}`).join(" ");
    const { data } = await axios.get(API, {
      params: {
        ...(pageSize && { pageSize }),
        ...((searchParam || excludedIdParams) && { q: `${searchParam} ${excludedIdParams}` }),
      },
    });

    return data;
  } catch (error) {
    return { error };
  }
};

const displayCards = async ({ pageSize }) => {
  setLoading(true);
  const { data, error } = await getCards({ pageSize });
  setLoading(false);

  if (error) {
    return (loadedPokemonCardsDiv.innerHTML = `<div class="error">Loading cards failed.</div>`);
  }

  data.forEach((cardData) => {
    loadedPokemonCardsDiv.innerHTML += createCard(cardData);
    loadedCards.push(cardData.id);
  });
};

const setLoading = (isLoading) => {
  if (isLoading) {
    loader.style.display = "block";
    searchInput.disabled = true;
    loadMoreButton.style.display = "none";
  } else {
    loader.style.display = "none";
    searchInput.disabled = false;
    loadMoreButton.style.display = "block";
  }
};

// Start app
window.onload = async function () {
  let timeout;

  searchInput.addEventListener("input", async () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      loadedPokemonCardsDiv.innerHTML = "";
      loadedCards = [];
      displayCards({ pageSize: 4 });
    }, 500);
  });

  loadMoreButton.addEventListener("click", () => displayCards({ pageSize: 4 }));

  displayCards({ pageSize: 4 });
};
