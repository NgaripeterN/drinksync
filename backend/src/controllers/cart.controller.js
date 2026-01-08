// For now, we'll use an in-memory cart.
// In a real application, you would use a database to store the cart.
const carts = {}; // Key: userId, Value: array of cart items

exports.addItemToCart = async (req, res) => {
  const { drinkId, quantity } = req.body;
  const userId = req.user.id;

  if (!carts[userId]) {
    carts[userId] = [];
  }

  const existingItemIndex = carts[userId].findIndex(item => item.drinkId === drinkId);

  if (existingItemIndex > -1) {
    carts[userId][existingItemIndex].quantity += quantity;
  } else {
    // In a real app, you would fetch drink details from the database
    carts[userId].push({ drinkId, quantity, price: 10, name: 'Sample Drink' });
  }

  res.status(201).json(carts[userId]);
};

exports.getCart = async (req, res) => {
  const userId = req.user.id;
  const cart = carts[userId] || [];
  res.json(cart);
};

exports.updateCartItemQuantity = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  if (!carts[userId]) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  const itemIndex = carts[userId].findIndex(item => item.drinkId === itemId);

  if (itemIndex > -1) {
    carts[userId][itemIndex].quantity = quantity;
    res.json(carts[userId]);
  } else {
    res.status(404).json({ message: 'Item not found in cart' });
  }
};

exports.removeItemFromCart = async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  if (!carts[userId]) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  const itemIndex = carts[userId].findIndex(item => item.drinkId === itemId);

  if (itemIndex > -1) {
    carts[userId].splice(itemIndex, 1);
    res.json(carts[userId]);
  } else {
    res.status(404).json({ message: 'Item not found in cart' });
  }
};

exports.clearCart = async (req, res) => {
  const userId = req.user.id;
  if (carts[userId]) {
    carts[userId] = [];
  }
  res.json(carts[userId] || []);
};
