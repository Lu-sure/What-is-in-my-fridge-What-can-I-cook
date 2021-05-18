if (module.hot) {
  module.hot.accept();
}

window.dataStorage = {
  listOfProducts: ['apple', 'chicken', 'olive oil', 'garlic', 'milk', 'tomato', 'shallot', 'fish'],
  querySet: [],
  isDataLoading: false,
  error: null,
  recipes: [],
};

window.renderApp = renderApp;
window.deleteListItem = deleteListItem;
window.editQuerySet = editQuerySet;
window.performSearch = performSearch;

function renderApp() {
  document.getElementById('app-root').innerHTML = `
        ${App()}
    `;
}

function App() {
  return `<div>
    <h1>What's in your fridge</h1>
    ${ListOfProducts()}
    ${AddItemToList()}
    ${SearchRecipes()}
    </div>`;
}

function ListOfProducts() {
  const { listOfProducts } = window.dataStorage;
  let content = '';
  listOfProducts.forEach(
    product =>
      (content += `
      <li>
        <label style="width: 50p;">${product}
            <input
                type="checkbox"
                name="product"
                value="${product}"
                style="width: 100px;"
                onchange="window.editQuerySet(this.value)"/>
        </label>
        <button value="${product}" onclick="window.deleteListItem(this.value)">delete</button>
      </li>`),
  );
  return content
    ? `<p>Product /<span style="color: royalblue; font-weight: 700;"> Search by:</span> </p><ul>${content}</ul>`
    : content;
}

function AddItemToList() {
  return `<h2>Add products to your fridge:</h2>
        <input
            type="text"
            onchange="window.dataStorage.listOfProducts.push(this.value);
            window.renderApp()"
        />
        <p> for example: carrot, onion, potato, beef, bacon, eggs</p>
    `;
}

function deleteListItem(value) {
  window.dataStorage.listOfProducts.splice(window.dataStorage.listOfProducts.indexOf(value), 1);
  window.renderApp();
}

function SearchRecipes() {
  const { recipes, isDataLoading, error, querySet } = window.dataStorage;
  const query = querySet.join(', ');
  const content = `<h2>Search recipes by chosen products</h2>
  <p>Pick items in the list above and click "Search" button.</p>
  <button onclick="window.performSearch();" style="color: royalblue; font-weight: 700;">Search</button>`;
  let recipesContent = ``;

  if (isDataLoading) {
    recipesContent = `<span>for ${query}</span><br>Loading...`;
  }
  if (error !== null) {
    recipesContent = error;
  }
  if (recipes.length > 0) {
    recipesContent = `Results for: ${query}`;
    recipesContent += recipes
      .map(({ recipe: { label, image, url, ingredientLines } }) => {
        return `
          <li>
            <h3>${label}</h3>
            <img src="${image}"/>
            <ul>
            ${ingredientLines
              .map(item => {
                return `<li>${item}</li>`;
              })
              .join('')}
            </ul>
            <a href="${url}" alt="">See more</a>
          </li>
        `;
      })
      .join('');
  }

  return content + recipesContent;
}

function editQuerySet(value) {
  if (window.dataStorage.querySet.includes(value)) {
    window.dataStorage.querySet.splice(window.dataStorage.querySet.indexOf(value), 1);
  } else {
    window.dataStorage.querySet.push(value);
  }
}

function loadData() {
  const query = window.dataStorage.querySet.join(' ');
  const url = `https://api.edamam.com/search?q=${query}&app_id=${process.env.EDAMAM_RECIPE_SEARCH_API_ID}&app_key=${process.env.EDAMAM_RECIPE_SEARCH_API_KEY}&from=0&to=5`;

  if (query === '') {
    const error = 'No products for request is chosen!';
    return Promise.resolve({ error });
  }
  window.dataStorage.isDataLoading = true;
  window.renderApp();

  return fetch(url)
    .then(response => response.json())
    .then(data => ({ data }));
}

function performSearch() {
  window.dataStorage.error = null;
  window.dataStorage.recipes = [];

  loadData()
    .then(({ error, data }) => {
      window.dataStorage.isDataLoading = false;

      if (error) {
        window.dataStorage.error = error;
      } else if (data) {
        const { hits } = data;
        if (hits.length > 0) {
          window.dataStorage.recipes = hits;
        } else {
          window.dataStorage.error = 'For your request is no answer.';
        }
      }
    })
    .catch(() => (window.dataStorage.error = 'Some error occurred.'))
    .finally(() => {
      window.renderApp();
      window.dataStorage.querySet = [];
    });
}

renderApp();
