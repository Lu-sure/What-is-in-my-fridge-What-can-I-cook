import { recipesByProduct } from './fixtures';

if (module.hot) {
  module.hot.accept();
}

window.dataStorage = {
  listOfProducts: ['apple', 'chicken', 'olive oil', 'garlic', 'milk', 'tomato', 'shallot', 'fish'],
  searchBy: [],
};

window.renderApp = renderApp;

function renderApp() {
  document.getElementById('app-root').innerHTML = `
        ${App()}
    `;
}

renderApp();

function App() {
  return `<div>
    <h1>What's in your fridge</h1>
    <p>Product   //  <span style="color: royalblue; font-weight: 700;">   Search by: </span> </p>
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
                onchange="window.defineQueryLine(this.value)"/>
        </label>
        <button value="${product}" onclick="window.deleteListItem(this.value)">delete</button>
      </li>`),
  );
  return `<ul>${content}</ul>`;
}

function AddItemToList() {
  return `<h2>Add item:</h2>
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

window.deleteListItem = deleteListItem;

function SearchRecipes() {
  const query = window.dataStorage.searchBy.join(' ');
  const answer = recipesByProduct[query];
  const content = `<h2>Search recipes by chosen products</h2>
  <p>Pick items, for example: "apple", "fish" or "chicken + olive oil + garlic" in the list above and click "Search" button.</p>
  <button onclick="window.renderApp()" style="color: royalblue; font-weight: 700;">Search</button> <br>`;
  let recipesContent = ``;

  if (answer) {
    recipesContent += answer
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

  window.dataStorage.searchBy = [];

  return `${content} <span>Query: ${query}</span><br> ${recipesContent} ${
    !!answer || !!query ? 'No result!' : ''
  }`;
}

function defineQueryLine(value) {
  if (window.dataStorage.searchBy.includes(value)) {
    window.dataStorage.searchBy.splice(window.dataStorage.searchBy.indexOf(value), 1);
  } else {
    window.dataStorage.searchBy.push(value);
  }
}

window.defineQueryLine = defineQueryLine;
