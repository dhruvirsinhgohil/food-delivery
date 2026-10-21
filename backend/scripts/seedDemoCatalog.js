require("dotenv").config();

const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
const Category = require("../models/Category");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

const catalog = [
  {
    name: "Spice Route Kitchen",
    description: "Comforting North Indian classics, prepared fresh with fragrant spices.",
    cuisines: ["North Indian", "Punjabi"],
    address: { street: "12 Alkapuri Main Road", city: "Vadodara", state: "Gujarat", pincode: "390007" },
    deliveryTime: 30,
    deliveryFee: 25,
    foods: [
      { name: "Paneer Tikka Masala", category: "Indian", description: "Chargrilled paneer in a creamy tomato masala.", price: 249, discount: 10, foodType: "veg" },
      { name: "Dal Makhani", category: "Indian", description: "Slow-cooked black lentils finished with butter and cream.", price: 199, foodType: "veg" },
      { name: "Chicken Biryani", category: "Biryani", description: "Aromatic basmati rice layered with spiced chicken.", price: 289, foodType: "non-veg" },
      { name: "Garlic Naan", category: "Indian", description: "Soft tandoor-baked bread brushed with garlic butter.", price: 59, foodType: "veg" },
    ],
  },
  {
    name: "Firestone Pizza Co.",
    description: "Hand-stretched dough, bubbling cheese, and classic wood-fired flavors.",
    cuisines: ["Italian", "Pizza"],
    address: { street: "28 Vesu Circle", city: "Surat", state: "Gujarat", pincode: "395007" },
    deliveryTime: 35,
    deliveryFee: 30,
    foods: [
      { name: "Margherita Pizza", category: "Pizza", description: "Tomato, mozzarella, basil, and a crisp stone-baked crust.", price: 229, discount: 5, foodType: "veg" },
      { name: "Farmhouse Pizza", category: "Pizza", description: "Bell peppers, onion, mushrooms, corn, and mozzarella.", price: 319, foodType: "veg" },
      { name: "Smoky BBQ Chicken Pizza", category: "Pizza", description: "Smoky barbecue chicken, red onion, and melted cheese.", price: 369, foodType: "non-veg" },
      { name: "Garlic Cheese Bread", category: "Snacks", description: "Toasted garlic bread topped with herbs and cheese.", price: 139, foodType: "veg" },
    ],
  },
  {
    name: "Green Bowl Café",
    description: "Colorful, feel-good bowls and fresh wraps made for everyday energy.",
    cuisines: ["Healthy", "Mediterranean"],
    address: { street: "5 Sindhu Bhavan Road", city: "Ahmedabad", state: "Gujarat", pincode: "380059" },
    deliveryTime: 25,
    deliveryFee: 20,
    foods: [
      { name: "Rainbow Buddha Bowl", category: "Healthy", description: "Quinoa, avocado, roasted vegetables, and lemon tahini.", price: 259, foodType: "vegan" },
      { name: "Paneer Tikka Wrap", category: "Healthy", description: "Grilled paneer, crunchy greens, and mint yogurt in a wrap.", price: 189, foodType: "veg" },
      { name: "Chickpea Power Salad", category: "Healthy", description: "Chickpeas, cucumber, tomato, herbs, and citrus dressing.", price: 219, foodType: "vegan" },
      { name: "Mango Yogurt Smoothie", category: "Drinks", description: "Alphonso mango blended with chilled yogurt.", price: 129, foodType: "veg" },
    ],
  },
  {
    name: "Sweet Crumb Bakery",
    description: "Small-batch bakes, warm pastries, and little treats for the sweet tooth.",
    cuisines: ["Bakery", "Desserts"],
    address: { street: "16 Law Garden Road", city: "Ahmedabad", state: "Gujarat", pincode: "380006" },
    deliveryTime: 25,
    deliveryFee: 15,
    foods: [
      { name: "Chocolate Fudge Brownie", category: "Desserts", description: "A rich, fudgy brownie with dark chocolate chunks.", price: 119, foodType: "veg" },
      { name: "Classic New York Cheesecake", category: "Desserts", description: "Creamy baked cheesecake on a buttery biscuit base.", price: 189, foodType: "veg" },
      { name: "Butter Croissant", category: "Bakery", description: "Flaky, golden pastry baked fresh each morning.", price: 99, foodType: "veg" },
      { name: "Strawberry Cupcake", category: "Desserts", description: "Soft vanilla sponge topped with strawberry buttercream.", price: 109, foodType: "veg" },
    ],
  },
  {
    name: "Wok & Roll Express",
    description: "Fast, flavorful Asian-inspired noodles, rice bowls, and wok favorites.",
    cuisines: ["Chinese", "Asian"],
    address: { street: "22 Race Course Road", city: "Vadodara", state: "Gujarat", pincode: "390007" },
    deliveryTime: 30,
    deliveryFee: 25,
    foods: [
      { name: "Veg Hakka Noodles", category: "Chinese", description: "Wok-tossed noodles with crunchy vegetables and savory sauces.", price: 179, foodType: "veg" },
      { name: "Chilli Paneer Bowl", category: "Chinese", description: "Crispy paneer in a tangy chilli sauce served with rice.", price: 229, foodType: "veg" },
      { name: "Chicken Fried Rice", category: "Chinese", description: "Wok-fried rice with chicken, egg, and spring onion.", price: 219, foodType: "non-veg" },
      { name: "Veg Spring Rolls", category: "Snacks", description: "Golden crisp rolls filled with seasoned vegetables.", price: 149, foodType: "vegan" },
    ],
  },
  {
    name: "Coastal Curry House",
    description: "South Indian favorites and coastal recipes, full of fresh herbs and spice.",
    cuisines: ["South Indian", "Coastal"],
    address: { street: "8 Ghod Dod Road", city: "Surat", state: "Gujarat", pincode: "395007" },
    deliveryTime: 35,
    deliveryFee: 25,
    foods: [
      { name: "Masala Dosa", category: "South Indian", description: "Crisp rice crepe with spiced potato and coconut chutney.", price: 159, foodType: "veg" },
      { name: "Idli Sambar", category: "South Indian", description: "Steamed rice cakes served with lentil sambar and chutneys.", price: 119, foodType: "vegan" },
      { name: "Andhra Chicken Curry", category: "South Indian", description: "Chicken simmered with curry leaves, chilli, and coastal spices.", price: 279, foodType: "non-veg" },
      { name: "Lemon Rice", category: "South Indian", description: "Tempered rice with lemon, peanuts, curry leaves, and turmeric.", price: 139, foodType: "vegan" },
    ],
  },
  {
    name: "Stack House Burgers",
    description: "Big, juicy burgers stacked fresh with house-made sauces and crisp sides.",
    cuisines: ["Burgers", "American"],
    address: { street: "31 Sindhu Bhavan Road", city: "Ahmedabad", state: "Gujarat", pincode: "380059" },
    deliveryTime: 25,
    deliveryFee: 20,
    foods: [
      { name: "Classic Smash Burger", category: "Burgers", description: "Seared beef patty, cheddar, pickles, and house sauce.", price: 279, foodType: "non-veg" },
      { name: "Crispy Veggie Burger", category: "Burgers", description: "Crispy vegetable patty with lettuce and tangy mayo.", price: 179, foodType: "veg" },
      { name: "BBQ Chicken Burger", category: "Burgers", description: "Grilled chicken, smoky barbecue sauce, and crunchy slaw.", price: 239, foodType: "non-veg" },
      { name: "Loaded Masala Fries", category: "Snacks", description: "Crispy fries tossed in house masala with a creamy dip.", price: 129, foodType: "veg" },
    ],
  },
  {
    name: "Taco Fiesta",
    description: "Colorful Mexican-inspired tacos, burrito bowls, and house-made salsas.",
    cuisines: ["Mexican", "Tex-Mex"],
    address: { street: "14 SG Highway", city: "Ahmedabad", state: "Gujarat", pincode: "380015" },
    deliveryTime: 30,
    deliveryFee: 25,
    foods: [
      { name: "Black Bean Tacos", category: "Mexican", description: "Soft tacos with smoky black beans, salsa, and fresh lime.", price: 189, foodType: "vegan" },
      { name: "Paneer Fajita Bowl", category: "Mexican", description: "Spiced paneer, rice, peppers, corn, and creamy salsa.", price: 249, foodType: "veg" },
      { name: "Chicken Burrito Bowl", category: "Mexican", description: "Grilled chicken with rice, beans, pico de gallo, and salsa.", price: 279, foodType: "non-veg" },
      { name: "Churros with Chocolate", category: "Desserts", description: "Cinnamon-dusted churros served with warm chocolate dip.", price: 149, foodType: "veg" },
    ],
  },
];

const demoFoodImages = {
  "Paneer Tikka Masala": "paneer-tikka-masala.jpg",
  "Dal Makhani": "dal-makhani.jpg",
  "Chicken Biryani": "chicken-biryani.jpg",
  "Garlic Naan": "garlic-naan.jpg",
  "Margherita Pizza": "margherita-pizza.jpg",
  "Farmhouse Pizza": "farmhouse-pizza.jpg",
  "Smoky BBQ Chicken Pizza": "smoky-bbq-chicken-pizza.jpg",
  "Garlic Cheese Bread": "garlic-cheese-bread.jpg",
  "Rainbow Buddha Bowl": "rainbow-buddha-bowl.jpg",
  "Paneer Tikka Wrap": "paneer-tikka-wrap.jpg",
  "Chickpea Power Salad": "chickpea-power-salad.jpg",
  "Mango Yogurt Smoothie": "mango-yogurt-smoothie.jpg",
  "Chocolate Fudge Brownie": "chocolate-fudge-brownie.jpg",
  "Classic New York Cheesecake": "new-york-cheesecake.jpg",
  "Butter Croissant": "butter-croissant.jpg",
  "Strawberry Cupcake": "strawberry-cupcake.jpg",
  "Veg Hakka Noodles": "veg-hakka-noodles.jpg",
  "Chilli Paneer Bowl": "chilli-paneer-bowl.jpg",
  "Chicken Fried Rice": "chicken-fried-rice.jpg",
  "Veg Spring Rolls": "veg-spring-rolls.jpg",
  "Masala Dosa": "masala-dosa.jpg",
  "Idli Sambar": "idli-sambar.jpg",
  "Andhra Chicken Curry": "andhra-chicken-curry.jpg",
  "Lemon Rice": "lemon-rice.jpg",
  "Classic Smash Burger": "classic-smash-burger.jpg",
  "Crispy Veggie Burger": "crispy-veggie-burger.jpg",
  "BBQ Chicken Burger": "bbq-chicken-burger.jpg",
  "Loaded Masala Fries": "loaded-masala-fries.jpg",
  "Black Bean Tacos": "black-bean-tacos.jpg",
  "Paneer Fajita Bowl": "paneer-fajita-bowl.jpg",
  "Chicken Burrito Bowl": "chicken-burrito-bowl.jpg",
  "Churros with Chocolate": "churros-with-chocolate.jpg",
};

const previousDemoImages = new Set([
  "1792578760267-920739578.jpg",
  "1792578810425-453688771.jpg",
  "1792579020424-67136258.jpg",
  "1792579123491-904326239.jpg",
  "1792579220881-431278419.jpg",
  "1792579281452-176547723.jpg",
  "1792579464804-463180209.jpg",
  "1792579625094-716899624.jpg",
].map((filename) => `/uploads/foods/${filename}`));

const foodImageFor = (foodName) => {
  const filename = demoFoodImages[foodName];
  if (!filename) throw new Error(`No demo photo is configured for "${foodName}".`);

  const imagePath = path.join(__dirname, "..", "uploads", "foods", "demo-catalog", filename);
  if (!fs.existsSync(imagePath)) throw new Error(`Demo photo is missing: ${imagePath}`);

  return `/uploads/foods/demo-catalog/${filename}`;
};

async function seedDemoCatalog() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured.");
  await mongoose.connect(process.env.MONGO_URI);

  const admin = await User.findOne({ role: "admin", isActive: true }).select("_id");
  if (!admin) throw new Error("An active admin account is required to seed the demo catalog.");

  let restaurantsCreated = 0;
  let foodsCreated = 0;
  let foodImagesUpdated = 0;
  const categories = new Map();

  for (const entry of catalog) {
    let restaurant = await Restaurant.findOne({ name: entry.name });
    if (!restaurant) {
      restaurant = await Restaurant.create({
        owner: admin._id,
        name: entry.name,
        description: entry.description,
        address: entry.address,
        cuisines: entry.cuisines,
        deliveryTime: entry.deliveryTime,
        deliveryFee: entry.deliveryFee,
        isOpen: true,
        isApproved: true,
        isActive: true,
      });
      restaurantsCreated += 1;
    } else {
      const changes = {};
      if (restaurant.isActive !== true) changes.isActive = true;
      if (restaurant.isOpen !== true) changes.isOpen = true;
      if (restaurant.isApproved !== true) changes.isApproved = true;
      if (Object.keys(changes).length) await Restaurant.updateOne({ _id: restaurant._id }, { $set: changes });
      restaurant = await Restaurant.findById(restaurant._id);
    }

    for (const menuItem of entry.foods) {
      let category = categories.get(menuItem.category);
      if (!category) {
        category = await Category.findOne({ name: new RegExp(`^${menuItem.category}$`, "i") });
        if (!category) category = await Category.create({ name: menuItem.category, description: `${menuItem.category} favorites` });
        categories.set(menuItem.category, category);
      }

      const existingFood = await Food.findOne({ restaurant: restaurant._id, name: menuItem.name });
      if (existingFood) {
        if (!existingFood.image || previousDemoImages.has(existingFood.image)) {
          existingFood.image = foodImageFor(menuItem.name);
          await existingFood.save();
          foodImagesUpdated += 1;
        }
        continue;
      }
      await Food.create({
        restaurant: restaurant._id,
        category: category._id,
        name: menuItem.name,
        description: menuItem.description,
        image: foodImageFor(menuItem.name),
        price: menuItem.price,
        discount: menuItem.discount || 0,
        foodType: menuItem.foodType,
        isAvailable: true,
      });
      foodsCreated += 1;
    }
  }

  console.log(`Demo catalog ready: ${restaurantsCreated} restaurants and ${foodsCreated} foods added; ${foodImagesUpdated} existing food images updated.`);
}

seedDemoCatalog()
  .catch((error) => {
    console.error("Demo catalog seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
