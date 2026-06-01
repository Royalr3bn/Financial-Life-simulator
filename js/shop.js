/* 
   PENNY WISE — Shop Logic
   Cart management, checkout, stat effects
    */

const SHOP_ITEMS = [
  { id: 'bread',    name: 'Bread & Basics',   price: 12, icon: '🍞', category: 'essential', effects: { energy: 5 } },
  { id: 'meat',     name: 'Meat & Protein',    price: 18, icon: '🥩', category: 'essential', effects: { energy: 8 } },
  { id: 'veg',      name: 'Fruit & Veg',       price: 15, icon: '🥬', category: 'essential', effects: { happiness: 5 } },
  { id: 'cleaning', name: 'Cleaning',          price: 8,  icon: '🧹', category: 'value',     effects: { stress: -3 } },
  { id: 'toilet',   name: 'Toiletries',        price: 10, icon: '🧻', category: 'value',     effects: { stress: -2 } },
  { id: 'steak',    name: 'Steak & Salmon',    price: 36, icon: '🥩', category: 'luxury',    effects: { happiness: 12 } },
  { id: 'pizza',    name: 'Pizza Delivery',    price: 16, icon: '🍕', category: 'impulse',   effects: { happiness: 15 } },
  { id: 'coffee',   name: 'Coffee Shop',       price: 4,  icon: '☕', category: 'impulse',   effects: { energy: 3 } },
  { id: 'game',     name: 'New Game',          price: 50, icon: '🎮', category: 'impulse',   effects: { happiness: 20 } },
  { id: 'trainers', name: 'Trainers',          price: 85, icon: '👟', category: 'impulse',   effects: { happiness: 18 } },
  { id: 'night',    name: 'Night Out',         price: 45, icon: '🍻', category: 'impulse',   effects: { happiness: 25 } },
  { id: 'mealprep', name: 'Meal Prep Kit',     price: 25, icon: '📚', category: 'value',     effects: { energy: 10 } },
];

function addToCart(itemId) {
  // Add the selected shop item to the shopping cart state.
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  GameState.cart.push({ ...item });
  updateUI();
}

function removeFromCart(index) {
  if (index < 0 || index >= GameState.cart.length) return;
  GameState.cart.splice(index, 1);
  updateUI();
}

function checkout() {
  // Process the cart checkout, apply item effects, and update spending totals.
  if (GameState.cart.length === 0) return;
  const total = GameState.cart.reduce((sum, item) => sum + item.price, 0);

  if (GameState.balance < total) {
    showNotification(`Can't afford checkout! Need £${total}`, 'warning');
    return;
  }

  GameState.balance -= total;

  GameState.cart.forEach(item => {
    if (item.effects.energy) GameState.energy = clamp(GameState.energy + item.effects.energy);
    if (item.effects.happiness) GameState.happiness = clamp(GameState.happiness + item.effects.happiness);
    if (item.effects.stress) GameState.stress = clamp(GameState.stress + item.effects.stress);

    if (item.category === 'essential' || item.category === 'value') {
      GameState.spending.groceries += item.price;
      GameState.groceryCount++;
    } else if (item.category === 'impulse' || item.category === 'luxury') {
      GameState.spending.impulse += item.price;
      GameState.impulseThisMonth++;
    }
  });

  if (GameState.groceryCount >= 5 && !GameState.achievements.homeCook.unlocked) {
    GameState.achievements.homeCook.unlocked = true;
  }

  GameState.cart = [];
  updateUI();
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-buy')) {
    const card = e.target.closest('.item-card');
    if (card) {
      const itemName = card.querySelector('.item-name');
      if (itemName) {
        const item = SHOP_ITEMS.find(i => i.name.toUpperCase() === itemName.textContent.trim());
        if (item) addToCart(item.id);
      }
    }
  }

  if (e.target.classList.contains('ci-remove')) {
    const index = parseInt(e.target.dataset.cartIndex);
    if (!isNaN(index)) removeFromCart(index);
  }

  if (e.target.classList.contains('btn-checkout')) {
    checkout();
  }
});