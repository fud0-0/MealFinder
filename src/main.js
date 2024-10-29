let mealPlanner = JSON.parse(localStorage.getItem('mealPlanner')) || [];

window.onload = function() {
  loadCategory();
  displayPlanner();
  displayGrocery();
};

// load category so dia appear dkt dropdown
function loadCategory() {
  const categorySelect = document.getElementById('categorySelect');

  fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
    .then(response => response.json())
    .then(data => {
      data.categories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category.strCategory; //ni value kita submit dkt form
        option.textContent = category.strCategory; //the same value yg submit dkt form tu kita displaykn dkt user
        categorySelect.appendChild(option); //tmbh dkt list
      });
    });
}

function searchIngredient() {
  const ingredient = document.getElementById('ingredientSearch').value;

  fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`)
    .then(response => response.json())
    .then(data => {
      const mealResults = document.getElementById('mealResults');
      mealResults.innerHTML = ''; /*using innerHTML dpt removekn content dlm existing meal
      results yg appear sblm ni so user blh tgk meal results baru based on search baru*/

      if (data.meals) {
        data.meals.forEach((meal) => {
          mealResults.innerHTML += `
            <div onclick="getInfo('${meal.idMeal}')">
              <h2>${meal.strMeal}</h2>
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            </div>
          `;
        });
      } else {
        mealResults.innerHTML = '<p>No meals found.</p>';
      }
    });
}

function filterCategory() {
  const category = document.getElementById('categorySelect').value;

  fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
    .then(response => response.json())
    .then(data => {
      const mealResults = document.getElementById('mealResults');
      mealResults.innerHTML = ''; 

      data.meals.forEach((meal) => {
        mealResults.innerHTML += `
          <div onclick="getInfo('${meal.idMeal}')">
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          </div> 
        `; //utk setiap meal kita search up akn kluar gmbr dia sekali
      });
    });
}

//ikut mcm madam ajar
function getInfo(id) {
  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(response => response.json())
    .then(data => {
      const meal = data.meals[0];
      const newItem = {
        id: meal.idMeal,
        name: meal.strMeal,
        thumbnail: meal.strMealThumb,
        category: meal.strCategory,
        area: meal.strArea,
        instructions: meal.strInstructions,
        youtubeLink: meal.strYoutube,
        ingredients: getIngredients(meal)
      };
      displayInfo(newItem);
    });
}

function displayInfo(meal) {
  const mealResults = document.getElementById('mealResults');
  mealResults.innerHTML = `
    <div>
      <h2>${meal.name}</h2>
      <img src="${meal.thumbnail}" alt="${meal.name}">
      <p><strong>Category:</strong> ${meal.category}</p>
      <p><strong>Area:</strong> ${meal.area}</p>
      <p><strong>Instructions:</strong> ${meal.instructions}</p>
      <p><strong>Ingredients:</strong></p>
      <ul>
        ${meal.ingredients.map(item => `<li>${item}</li>`).join('')}
      </ul>
      <button onclick="addMeal('${meal.name}')">Add to Meal Planner</button>
      ${meal.youtubeLink ? `<a href="${meal.youtubeLink}" target="_blank">Watch on YouTube</a>` : ''}
    </div>
  `; //target="_blank" ni bkkkn yt video tu dkt new browser/page
}

function getIngredients(meal) {
  const ingredientsList = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ingredient) {
      ingredientsList.push(`${measure} ${ingredient}`);
    }
  }
  return ingredientsList;
}

function addMeal(meal) {
  if (!mealPlanner.includes(meal)) {
    mealPlanner.push(meal);
    localStorage.setItem('mealPlanner', JSON.stringify(mealPlanner));
    alert(`${meal} added to your meal planner.`);
    displayPlanner();
  } else {
    alert(`${meal} is already in your planner.`);
  }
}

function displayPlanner() {
  const planner = document.getElementById('mealPlanner');
  planner.innerHTML = '';
  mealPlanner.forEach(meal => {
    planner.innerHTML += `
      <div>
        <p>${meal}</p>
        <button onclick="removeMeal('${meal}')">Remove</button>
      </div>
    `;
  });
}

function removeMeal(meal) {
  mealPlanner = mealPlanner.filter(item => item !== meal);
  localStorage.setItem('mealPlanner', JSON.stringify(mealPlanner));
  displayPlanner();
}

let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];


function addGrocery() {
  const item = document.getElementById('groceryItem').value;
  if (item && !groceryList.includes(item)) /*item=make sure user input sesuatu
  (tkleh empty), groceryList=tmpt kita store items, includes(item)=tgk klau input user yg
  baru ni ada dh ke dlm groceryList td, !=system tmbh item baru only if item baru tk
  sama dgn apa yg dh ada dlm groceryList */ {
    groceryList.push(item);  
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
    document.getElementById('groceryItem').value = ''; 
    displayGrocery();    
  } else if (!item) {
    alert("Enter an item.");
  } else {
    alert("Item already exists.");
  }
}

function displayGrocery() {
  const groceryListDiv = document.getElementById('groceryList');
   //bila page refresh, items tk duplicate
  groceryListDiv.innerHTML = ''; // Initialize the innerHTML to prevent duplication
  groceryList.forEach((item, index) => {
    groceryListDiv.innerHTML += `
      <div>
        <input type="text" value="${item}" id="groceryItem-${index}" onblur="editGrocery(${index})">
        <button onclick="removeGrocery(${index})">❌</button>
      </div>
    `;
  });
}

function editGrocery(index) {
  const editedItem = document.getElementById(`groceryItem-${index}`).value;
  groceryList[index] = editedItem;
  localStorage.setItem('groceryList', JSON.stringify(groceryList));
}

function removeGrocery(index) {
  groceryList.splice(index, 1); /*index ikut position item yg kita nk remove
  (so that dia remove ikut user, not first/last item). 1 means remove
  satu item sahaja */
  localStorage.setItem('groceryList', JSON.stringify(groceryList));
  displayGrocery();
}
