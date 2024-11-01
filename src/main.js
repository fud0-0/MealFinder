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
        option.value = category.strCategory; // ni value kita submit dkt form
        option.textContent = category.strCategory; // the same value yg submit dkt form tu kita displaykn dkt user
        categorySelect.appendChild(option); // tmbh dkt list
      });
    });
}

function searchIngredient() {
  const ingredient = document.getElementById('ingredientSearch').value;

  fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`)
    .then(response => response.json())
    .then(data => {
      const mealResults = document.getElementById('mealResults');
      mealResults.innerHTML = ''; /*using innerHTML dpt removekn content dlm existing meal results yg appear sblm ni so user blh tgk meal results baru based on search baru*/

      if (data.meals) /*check klau meal exist ke tk*/ {
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
        `;
      });
    });
}

function getInfo(id) {
  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(response => response.json())
    .then(data => {
      const meal = data.meals[0];
      displayInfo({
        id: meal.idMeal,
        name: meal.strMeal,
        thumbnail: meal.strMealThumb,
        category: meal.strCategory,
        area: meal.strArea,
        instructions: meal.strInstructions,
        youtubeLink: meal.strYoutube,
        ingredients: getIngredients(meal)
      });
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
      ${meal.youtubeLink ? `<a href="${meal.youtubeLink}" target="_blank">Watch on YouTube</a>` : ''}
    </div>
  `;
}

function getIngredients(meal) {
  const ingredientsList = []; //utk store ingredients + measurements

  for (let i = 1; i <= 20; i++) /*dia loop smp 20 ja sbb api blh contain
  up to 20 ing only*/ {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`]; //dynamically retrieve ing & measurements

    if (ingredient) {
      ingredientsList.push(`${measure} ${ingredient}`);
    } //tmbh ingredients & measurements 2gether
  }
  return ingredientsList;
}


function displayPlanner() {
  const planner = document.getElementById('mealPlanner');
  planner.innerHTML = '';
  mealPlanner.forEach((meal, index) => {
    planner.innerHTML += `
      <div>
        <input type="text" value="${meal.name}" id="meal-${index}" placeholder="Meal Name, Description" disabled />
        <button onclick="editMeal(${index})" id="edit-btn-${index}">✏️ Edit</button>
        <button onclick="removeMeal(${index})">❌</button>
      </div>
    `;
  });
}


function addMeal() {
  const mealInput = document.getElementById('mealInput');
  const mealDetails = mealInput.value;

  if (mealDetails && !mealPlanner.some(meal => meal.name === mealDetails)) /* check
  user input tk empty, and tk sama dgn existing meal plans*/{
    mealPlanner.push({ name: mealDetails });
    localStorage.setItem('mealPlanner', JSON.stringify(mealPlanner));
    mealInput.value = '';
    displayPlanner(); // dia akn call blk meal plan yg diupdate
  } else if (!mealDetails) {
    alert("Enter meal details.");
  } else {
    alert("Meal already exists.");
  }
}


function editMeal(index) {
  const mealInput = document.getElementById(`meal-${index}`);
  const editButton = document.getElementById(`edit-btn-${index}`);
  
  if (editButton.textContent === '✏️') {
    mealInput.disabled = false;  //bg user input 
    editButton.textContent = '💾'; 
  } else {
    const editedMeal = mealInput.value();
    if (editedMeal) {
      mealPlanner[index] = { name: editedMeal }; //update
      localStorage.setItem('mealPlanner', JSON.stringify(mealPlanner));
    }
    mealInput.disabled = true; // hntikan user drpd tulis anything in box lps dh save
    editButton.textContent = '✏️'; 
  }
}


function removeMeal(index) {
  mealPlanner.splice(index, 1); /*index ikut position item yg kita nk remove
  (so that dia remove ikut user, not first/last item). 1 means remove
  satu item sahaja */
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
  groceryListDiv.innerHTML = ''; // utk elakkan duplication, kita setkn kpd empty string
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
  groceryList.splice(index, 1); //buang satu, tk buang lain
  localStorage.setItem('groceryList', JSON.stringify(groceryList));
  displayGrocery();
}
