
from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    session,
    redirect,
    url_for,
    flash,
    send_from_directory,
)
import json
import os
from datetime import datetime, timezone, timedelta
import uuid
from functools import wraps
import hashlib
import pymongo
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Set static_folder and template_folder explicitly for robust path resolution
app = Flask(__name__, static_folder="static", template_folder="templates")
app.secret_key = "delicious_roll_secret_2024"
# Ensure session cookies are set properly for persistence and security
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True if using HTTPS

# Sample menu data with real food descriptions
MENU_DATA = {
    "featured_rolls": [
        {
            "id": 1,
            "name": "Classic Chicken Roll",
            "description": "Tender grilled chicken breast with crisp lettuce, juicy tomatoes, and our signature creamy sauce wrapped in a warm tortilla",
            "price": 1078.17,  # $12.99 * 83
            "image": "/static/images/R1.jpg",
            "rating": 4.8,
            "category": "chicken",
            "ingredients": [
                "grilled chicken breast",
                "crisp lettuce",
                "fresh tomatoes",
                "cucumber",
                "signature sauce",
            ],
            "calories": 450,
            "spicy_level": 1,
            "prep_time": "8-10 mins",
        },
        {
            "id": 2,
            "name": "Spicy Beef Delight",
            "description": "Succulent marinated beef with roasted peppers, melted cheese, and spicy chipotle sauce",
            "price": 1244.17,  # $14.99 * 83
            "image": "/static/images/R2.jpg",
            "rating": 4.9,
            "category": "beef",
            "ingredients": [
                "marinated beef",
                "roasted peppers",
                "melted cheese",
                "red onions",
                "chipotle sauce",
            ],
            "calories": 520,
            "spicy_level": 3,
            "popular": True,
            "prep_time": "10-12 mins",
        },
        {
            "id": 3,
            "name": "Mediterranean Veggie",
            "description": "Fresh vegetables with creamy hummus, feta cheese, and Mediterranean herbs",
            "price": 995.17,   # $11.99 * 83
            "image": "/static/images/R3",
            "rating": 4.7,
            "category": "vegetarian",
            "ingredients": [
                "mixed vegetables",
                "hummus",
                "feta cheese",
                "olives",
                "herbs",
            ],
            "calories": 380,
            "spicy_level": 0,
            "prep_time": "6-8 mins",
        },
        {
            "id": 4,
            "name": "BBQ Pulled Pork",
            "description": "Slow-cooked BBQ pulled pork with coleslaw and tangy barbecue sauce",
            "price": 1285.67,  # $15.49 * 83
            "image": "/static/images/R4.jpg",
            "rating": 4.8,
            "category": "pork",
            "ingredients": ["BBQ pulled pork", "coleslaw", "pickles", "BBQ sauce"],
            "calories": 580,
            "spicy_level": 2,
            "prep_time": "12-15 mins",
        },
        {
            "id": 5,
            "name": "Crispy Fish Fusion",
            "description": "Golden crispy fish fillet with fresh slaw and zesty tartar sauce",
            "price": 1161.17,  # $13.99 * 83
            "image": "/static/images/R5.jpg",
            "rating": 4.6,
            "category": "seafood",
            "ingredients": [
                "crispy fish fillet",
                "fresh slaw",
                "tartar sauce",
                "lettuce",
            ],
            "calories": 480,
            "spicy_level": 1,
            "prep_time": "10-12 mins",
        },
        {
            "id": 6,
            "name": "Buffalo Chicken Wrap",
            "description": "Spicy buffalo chicken with ranch dressing, celery, and blue cheese crumbles",
            "price": 1119.67,  # $13.49 * 83
            "image": "/static/images/R1.jpg",
            "rating": 4.7,
            "category": "chicken",
            "ingredients": [
                "buffalo chicken",
                "ranch dressing",
                "celery",
                "blue cheese",
            ],
            "calories": 510,
            "spicy_level": 3,
            "prep_time": "8-10 mins",
        },
        {
            "id": 7,
            "name": "Tandoori Paneer Delight",
            "description": "Grilled tandoori-spiced paneer with mint chutney, caramelized onions, and fresh coriander wrapped in a soft tortilla",
            "price": 1324.17,  # $15.95 * 83
            "image": "/static/images/R2.jpg",
            "rating": 4.9,
            "category": "vegetarian",
            "ingredients": [
                "tandoori paneer",
                "mint chutney",
                "caramelized onions",
                "fresh coriander",
                "yogurt sauce",
                "bell peppers",
            ],
            "calories": 420,
            "spicy_level": 2,
            "popular": True,
            "prep_time": "10-12 mins",
        },
    ],
    "sides": [
        {
            "id": 101,
            "name": "Crispy Sweet Potato Fries",
            "price": 497.17,  # $5.99 * 83
            "image": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop",
        },
        {
            "id": 102,
            "name": "Loaded Onion Rings",
            "price": 538.67,  # $6.49 * 83
            "image": "https://images.unsplash.com/photo-1639024471283-03518883512d?w=300&h=200&fit=crop",
        },
        {
            "id": 103,
            "name": "Nachos Supreme",
            "price": 746.17,  # $8.99 * 83
            "image": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300&h=200&fit=crop",
        },
        {
            "id": 104,
            "name": "Garden Fresh Salad",
            "price": 621.67,  # $7.49 * 83
            "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop",
        },
    ],
    "drinks": [
        {
            "id": 201,
            "name": "Fresh Lemonade",
            "description": "Refreshing homemade lemonade with a perfect balance of sweet and tart flavors",
            "price": 331.17,  # $3.99 * 83
            "image": "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=300&h=200&fit=crop",
            "category": "cold",
            "cold": True,
            "size": "Regular",
            "popular": True,
        },
        {
            "id": 202,
            "name": "Iced Green Tea",
            "description": "Premium green tea served over ice with natural antioxidants",
            "price": 248.17,  # $2.99 * 83
            "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop",
            "category": "tea",
            "cold": True,
            "size": "Regular",
        },
        {
            "id": 203,
            "name": "Tropical Smoothie",
            "description": "Blend of mango, pineapple, and coconut with a hint of lime",
            "price": 580.17,  # $6.99 * 83
            "image": "https://images.unsplash.com/photo-1546173159-315724a31696?w=300&h=200&fit=crop",
            "category": "smoothies",
            "cold": True,
            "size": "Large",
            "organic": True,
        },
        {
            "id": 204,
            "name": "Premium Coffee",
            "description": "Rich and aromatic coffee brewed from freshly ground beans",
            "price": 206.67,  # $2.49 * 83
            "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop",
            "category": "coffee",
            "hot": True,
            "caffeine": True,
            "size": "Regular",
        },
        {
            "id": 205,
            "name": "Chai Latte",
            "description": "Spiced Indian tea with steamed milk and aromatic spices",
            "price": 331.17,  # $3.99 * 83
            "image": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop",
            "category": "tea",
            "hot": True,
            "caffeine": True,
            "size": "Regular",
            "popular": True,
        },
        {
            "id": 206,
            "name": "Berry Blast Smoothie",
            "description": "Mixed berries with yogurt and honey for a healthy boost",
            "price": 497.17,  # $5.99 * 83
            "image": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&h=200&fit=crop",
            "category": "smoothies",
            "cold": True,
            "size": "Large",
            "organic": True,
            "new": True,
        },
        {
            "id": 207,
            "name": "Espresso Shot",
            "description": "Strong and concentrated coffee shot for the perfect caffeine kick",
            "price": 165.67,  # $1.99 * 83
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&h=200&fit=crop",
            "category": "coffee",
            "hot": True,
            "caffeine": True,
            "size": "Small",
        },
        {
            "id": 208,
            "name": "Mint Iced Tea",
            "description": "Refreshing mint-infused iced tea with a cooling sensation",
            "price": 248.17,  # $2.99 * 83
            "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop",
            "category": "tea",
            "cold": True,
            "size": "Regular",
        },
        {
            "id": 209,
            "name": "Hot Chocolate",
            "description": "Rich and creamy hot chocolate topped with marshmallows",
            "price": 372.17,  # $4.49 * 83
            "image": "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=300&h=200&fit=crop",
            "category": "hot",
            "hot": True,
            "size": "Regular",
            "popular": True,
        },
        {
            "id": 210,
 "name": "Orange Juice",
            "description": "Freshly squeezed orange juice packed with vitamin C",
            "price": 290.17,  # $3.49 * 83
            "image": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=200&fit=crop",
            "category": "cold",
            "cold": True,
            "size": "Regular",
            "organic": True,
        },
        {
            "id": 211,
            "name": "Cappuccino",
            "description": "Classic Italian coffee with equal parts espresso, steamed milk, and milk foam",
            "price": 372.17,  # $4.49 * 83
            "image": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=200&fit=crop",
            "category": "coffee",
            "hot": True,
            "caffeine": True,
            "size": "Regular",
        },
        {
            "id": 212,
            "name": "Herbal Tea",
            "description": "Soothing chamomile and lavender herbal tea blend",
            "price": 206.67,  # $2.49 * 83
            "image": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop",
            "category": "tea",
            "hot": True,
            "size": "Regular",
        },
        {
            "id": 213,
            "name": "Strawberry Banana Smoothie",
            "description": "Classic combination of strawberries and banana with almond milk",
            "price": 497.17,  # $5.99 * 83
            "image": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&h=200&fit=crop",
            "category": "smoothies",
            "cold": True,
            "size": "Large",
            "organic": True,
        },
        {
            "id": 214,
            "name": "Iced Americano",
            "description": "Espresso shots over ice with cold water for a refreshing coffee experience",
            "price": 290.17,  # $3.49 * 83
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&h=200&fit=crop",
            "category": "coffee",
            "cold": True,
            "caffeine": True,
            "size": "Regular",
            "new": True,
        },
    ],
}

# --- MongoDB Connection Setup ---
load_dotenv()
MONGO_URI = os.environ.get('MONGO_URI')
mongo_client = pymongo.MongoClient(MONGO_URI)
db = mongo_client['userauth']  # Use the 'userauth' database as shown in your MongoDB

# --- User Authentication Helpers ---
def get_db():
    return db

def check_email_exists(email):
    return db['users'].find_one({'email': email}) is not None

def check_phone_exists(phone):
    return db['users'].find_one({'phone': phone}) is not None

def signup_user(full_name, email, phone, password):
    if check_email_exists(email):
        return {'success': False, 'message': 'Email already exists'}
    if check_phone_exists(phone):
        return {'success': False, 'message': 'Phone number already exists'}
    hashed_pw = generate_password_hash(password)
    user = {
        'email': email,
        'password': hashed_pw,
        'phone': phone,
        'full_name': full_name,
        'name': full_name,  # Keep both for compatibility
        'created_at': datetime.now(timezone.utc)
    }
    db['users'].insert_one(user)
    return {'success': True, 'message': 'User registered successfully'}

def login_user(email, password):
    user = db['users'].find_one({'email': email})
    if not user:
        return {'success': False, 'message': 'Email not found'}
    if not check_password_hash(user['password'], password):
        return {'success': False, 'message': 'Incorrect password'}
    # Remove _id to avoid JSON serialization error
    if '_id' in user:
        del user['_id']
    return {'success': True, 'user': user, 'user_name': user.get('full_name', user.get('name', email))}

# Initialize session cart
def init_cart():
    if "cart" not in session:
        session["cart"] = []
    if "cart_total" not in session:
        session["cart_total"] = 0.0


@app.before_request
def before_request():
    init_cart()


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print('DEBUG: login_required - session user_email:', session.get('user_email'))
        if not session.get('user_email'):
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function


# Routes
@app.route("/")
def home():
    # Check if user is logged in (e.g., session['user_email'] exists)
    return render_template("index.html", featured_rolls=MENU_DATA["featured_rolls"][:4], force_signup_modal=False)


@app.route("/menu")
@login_required
def menu():
    category = request.args.get("category", "all")
    search = request.args.get("search", "")

    rolls = MENU_DATA["featured_rolls"]
    sides = MENU_DATA["sides"]
    drinks = MENU_DATA["drinks"]

    # Filter by category
    if category != "all":
        rolls = [roll for roll in rolls if roll["category"] == category]

    # Filter by search
    if search:
        rolls = [
            roll
            for roll in rolls
            if search.lower() in roll["name"].lower()
            or search.lower() in roll["description"].lower()
        ]

    categories = ["all", "chicken", "beef", "vegetarian", "pork", "seafood"]

    return render_template(
        "menu.html",
        rolls=rolls,
        sides=sides,
        drinks=drinks,
        categories=categories,
        current_category=category,
        search_query=search,
    )


@app.route("/drinks")
@login_required
def drinks():
    search = request.args.get("search", "")
    category = request.args.get("category", "all")

    drinks = MENU_DATA["drinks"]
    
    # Filter by search
    if search:
        drinks = [
            drink
            for drink in drinks
            if search.lower() in drink["name"].lower() or search.lower() in drink.get("description", "").lower()
        ]

    # Filter by category
    if category != "all":
        drinks = [drink for drink in drinks if drink.get("category") == category]

    # Get category counts for better UX
    category_counts = {}
    all_drinks = MENU_DATA["drinks"]
    categories = ["all", "hot", "cold", "smoothies", "coffee", "tea"]
    
    for cat in categories:
        if cat == "all":
            category_counts[cat] = len(all_drinks)
        else:
            category_counts[cat] = len([d for d in all_drinks if d.get("category") == cat])

    return render_template(
        "drinks.html",
        drinks=drinks,
        categories=categories,
        category_counts=category_counts,
        current_category=category,
        search_query=search,
    )


@app.route("/customize")
@login_required
def customize():
    # Define available ingredients for customization with correct image filenames
    ingredients = [
        {
            "id": 1,
            "name": "Grilled Chicken",
            "price": 249.0,  # $3.0 * 83
            "image": "/static/images/ingredient_chicken.png",
        },
        {
            "id": 2,
            "name": "Spicy Beef",
            "price": 290.5,  # $3.5 * 83
            "image": "/static/images/ingredient_beef.png",
        },
        {
            "id": 3,
            "name": "Crispy Fish",
            "price": 265.6,  # $3.2 * 83
            "image": "/static/images/ingredient_fish.png",
        },
        {
            "id": 4,
            "name": "Fresh Lettuce",
            "price": 58.1,   # $0.7 * 83
            "image": "/static/images/ingredient_lettuce.png",
        },
        {
            "id": 5,
            "name": "Tomato",
            "price": 41.5,   # $0.5 * 83
            "image": "/static/images/ingredient_tomato.png",
        },
        {
            "id": 6,
            "name": "Cucumber",
            "price": 41.5,   # $0.5 * 83
            "image": "/static/images/ingredient_cucumber.png",
        },
        {
            "id": 7,
            "name": "Cheese",
            "price": 83.0,   # $1.0 * 83
            "image": "/static/images/ingredient_cheese.png",
        },
        {
            "id": 8,
            "name": "Hummus",
            "price": 99.6,   # $1.2 * 83
            "image": "/static/images/ingredient_hummus.png",
        },
        {
            "id": 9,
            "name": "BBQ Sauce",
            "price": 49.8,   # $0.6 * 83
            "image": "/static/images/ingredient_bbq.png",
        },
        {
            "id": 10,
            "name": "Chipotle Sauce",
            "price": 49.8,   # $0.6 * 83
            "image": "/static/images/ingredient_chipotle.png",
        },
        {
            "id": 11,
            "name": "Feta Cheese",
            "price": 83.0,   # $1.0 * 83
            "image": "/static/images/ingredient_feta.png",
        },
        {
            "id": 12,
            "name": "Olives",
            "price": 66.4,   # $0.8 * 83
            "image": "/static/images/ingredient_olives.png",
        },
        {
            "id": 13,
            "name": "Coleslaw",
            "price": 74.7,   # $0.9 * 83
            "image": "/static/images/ingredient_coleslaw.png",
        },
        {
            "id": 14,
            "name": "Pickles",
            "price": 41.5,   # $0.5 * 83
            "image": "/static/images/ingredient_pickles.png",
        },
        {
            "id": 15,
            "name": "Ranch Dressing",
            "price": 58.1,   # $0.7 * 83
            "image": "/static/images/ingredient_ranch.png",
        },
        {
            "id": 16,
            "name": "Buffalo Sauce",
            "price": 58.1,   # $0.7 * 83
            "image": "/static/images/ingredient_buffalo.png",
        },
        {
            "id": 17,
            "name": "Celery",
            "price": 33.2,   # $0.4 * 83
            "image": "/static/images/ingredient_celery.png",
        },
        {
            "id": 18,
            "name": "Blue Cheese",
            "price": 91.3,   # $1.1 * 83
            "image": "/static/images/ingredient_bluecheese.png",
        },
        {
            "id": 19,
            "name": "Tortilla Wrap",
            "price": 83.0,   # $1.0 * 83
            "image": "/static/images/ingredient_wrap.png",
            "base": True,
        },
    ]
    return render_template("customize.html", ingredients=ingredients)


@app.route("/about")
@login_required
def about():
    team_members = [
        {
            "name": "Chef Marco Rodriguez",
            "role": "Head Chef",
            "image": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop",
            "bio": "Master of flavor combinations with 15 years experience",
        },
        {
            "name": "Sarah Chen",
            "role": "Operations Manager",
            "image": "https://images.unsplash.com/photo-1594736797933-d0acc43d7c4c?w=300&h=300&fit=crop",
            "bio": "Ensuring perfect service and customer satisfaction",
        },
        {
            "name": "Tony Martinez",
            "role": "Grill Master",
            "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop",
            "bio": "Grilling perfection with passion and precision",
        },
        {
            "name": "Lisa Thompson",
            "role": "Nutrition Expert",
            "image": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop",
            "bio": "Creating healthy and delicious combinations",
        },
    ]

    stats = {
        "happy_customers": 25000,
        "rolls_served": 150000,
        "years_experience": 5,
        "daily_fresh_ingredients": 200,
    }

    return render_template("about.html", team_members=team_members, stats=stats)


@app.route("/contact")
@login_required
def contact():
    return render_template("contact.html")


@app.route("/profile")
def profile():
    # Check if user is logged in
    if not session.get('user_email'):
        # Redirect to signin page instead of showing home with modal
        return redirect(url_for('signin'))
    
    try:
        user_email = session['user_email']
        
        # Get user info from database
        db = get_db()
        users_collection = db['users']
        user = users_collection.find_one({'email': user_email})
        
        if not user:
            return redirect(url_for('home'))
        
        # Convert ObjectId to string for JSON serialization
        if '_id' in user:
            user['_id'] = str(user['_id'])
        
        # Get user's orders
        orders_collection = db['orders']
        orders = list(orders_collection.find({'user_email': user_email}).sort('order_date', -1))
        
        # Convert ObjectIds to strings for JSON serialization
        for order in orders:
            if '_id' in order:
                order['_id'] = str(order['_id'])
        
        # Calculate basic statistics
        total_orders = len(orders)
        total_spent = sum(order.get('total_amount', 0) for order in orders)
        
        return render_template('profile.html', 
                             user=user, 
                             orders=orders, 
                             total_orders=total_orders, 
                             total_spent=total_spent)
    except Exception as e:
        print(f"Error in profile route: {str(e)}")
        return redirect(url_for('home'))


@app.route("/cart")
@login_required
def cart():
    cart_items = session.get("cart", [])
    total = session.get("cart_total", 0.0)
    return render_template("cart.html", cart_items=cart_items, total=total)


@app.route("/login")
def login():
    if 'user_email' in session:
        return redirect(url_for('home'))
    return render_template("index.html")


@app.route("/signin")
def signin():
    if 'user_email' in session:
        return redirect(url_for('home'))
    return render_template("signin.html")


# API Routes
@app.route("/api/add_to_cart", methods=["POST"])
@login_required
def add_to_cart():
    try:
        data = request.get_json()
        item_id = data.get("id")
        item_type = data.get("type", "roll")
        quantity = data.get("quantity", 1)

        # Convert item_id to int for comparison with menu data
        try:
            item_id_int = int(item_id)
        except (ValueError, TypeError):
            return jsonify({"success": False, "message": "Invalid item ID"})

        # Find the item in menu data
        item = None
        if item_type == "roll":
            item = next(
                (roll for roll in MENU_DATA["featured_rolls"] if roll["id"] == item_id_int),
                None,
            )
        elif item_type == "side":
            item = next(
                (side for side in MENU_DATA["sides"] if side["id"] == item_id_int), None
            )
        elif item_type == "drink":
            item = next(
                (drink for drink in MENU_DATA["drinks"] if drink["id"] == item_id_int), None
            )

        if not item:
            return jsonify({"success": False, "message": "Item not found"})

        # Add to cart
        cart_item = {
            "id": str(uuid.uuid4()),
            "item_id": item_id_int,
            "name": item["name"],
            "price": item["price"],
            "quantity": quantity,
            "type": item_type,
            "image": item.get("image", ""),
        }

        session["cart"].append(cart_item)
        session["cart_total"] = sum(
            item["price"] * item["quantity"] for item in session["cart"]
        )
        session.modified = True

        return jsonify(
            {
                "success": True,
                "message": f'{item["name"]} added to cart! 🛒',
                "cart_count": len(session["cart"]),
                "cart_total": session["cart_total"],
            }
        )

    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@app.route("/api/update_cart_qty", methods=["POST"])
@login_required
def update_cart_qty():
    try:
        data = request.get_json()
        item_id = data.get("id")
        delta = data.get("delta", 0)
        
        cart = session.get("cart", [])
        
        # Find the item in cart
        cart_item = next((item for item in cart if item["id"] == item_id), None)
        
        if not cart_item:
            return jsonify({"success": False, "message": "Item not found in cart"})
        
        # Update quantity
        new_quantity = cart_item["quantity"] + delta
        
        if new_quantity <= 0:
            # Remove item if quantity becomes 0 or negative
            cart.remove(cart_item)
        else:
            cart_item["quantity"] = new_quantity
        
        # Update cart total
        session["cart_total"] = sum(
            item["price"] * item["quantity"] for item in cart
        )
        session.modified = True
        
        return jsonify({
            "success": True,
            "message": "Cart updated successfully",
            "cart_count": len(cart),
            "cart_total": session["cart_total"]
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@app.route("/api/remove_cart_item", methods=["POST"])
@login_required
def remove_cart_item():
    try:
        data = request.get_json()
        item_id = data.get("id")
        
        cart = session.get("cart", [])
        
        # Find and remove the item
        cart_item = next((item for item in cart if item["id"] == item_id), None)
        
        if not cart_item:
            return jsonify({"success": False, "message": "Item not found in cart"})
        
        cart.remove(cart_item)
        
        # Update cart total
        session["cart_total"] = sum(
            item["price"] * item["quantity"] for item in cart
        )
        session.modified = True
        
        return jsonify({
            "success": True,
            "message": "Item removed from cart",
            "cart_count": len(cart),
            "cart_total": session["cart_total"]
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@app.route("/api/add_custom_roll", methods=["POST"])
@login_required
def add_custom_roll():
    try:
        data = request.get_json()
        name = data.get("name", "Custom Roll")
        price = float(data.get("price", 0))
        ingredients = data.get("ingredients", [])
        custom_image = data.get("image", "")

        # Generate unique ID for custom roll
        custom_id = str(uuid.uuid4())

        # Create cart item for custom roll
        cart_item = {
            "id": custom_id,
            "item_id": "custom",
            "name": name,
            "price": price,
            "quantity": 1,
            "type": "custom_roll",
            "ingredients": ingredients,
            "image": custom_image,  # Base64 encoded image
            "custom": True,
        }

        session["cart"].append(cart_item)
        session["cart_total"] = sum(
            item["price"] * item["quantity"] for item in session["cart"]
        )
        session.modified = True

        return jsonify(
            {
                "success": True,
                "message": f"{name} added to cart! 🌯",
                "cart_count": len(session["cart"]),
                "cart_total": session["cart_total"],
            }
        )

    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@app.route("/api/get_cart_info")
@login_required
def get_cart_info():
    cart = session.get("cart", [])
    cart_total = session.get("cart_total", 0.0)
    return jsonify({
        "success": True,
        "cart": cart,
        "cart_count": len(cart),
        "cart_total": cart_total,
    })


@app.route("/api/signup", methods=["POST"])
def api_signup():
    data = request.get_json()
    full_name = data.get("full_name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")
    result = signup_user(full_name, email, phone, password)
    
    # If signup successful, set session data
    if result.get("success"):
        session["user_email"] = email
        session["user_name"] = full_name
        session.modified = True
    
    return jsonify(result)


@app.route("/api/check-email", methods=["POST"])
def check_email():
    """Check if email already exists"""
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"success": False, "message": "Email is required"})
    
    result = check_email_exists(email)
    return jsonify(result)


@app.route("/api/check-phone", methods=["POST"])
def check_phone():
    """Check if phone number already exists"""
    data = request.get_json()
    phone = data.get("phone")
    if not phone:
        return jsonify({"success": False, "message": "Phone number is required"})
    
    result = check_phone_exists(phone)
    return jsonify(result)


@app.route("/api/login", methods=["POST"])
def api_login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        print(f"DEBUG: /api/login - received email: {email}, password: {password}")
        result = login_user(email, password)
        print(f"DEBUG: /api/login - login_user result: {result}")
        # If login successful, set session data
        if result["success"]:
            session["user_email"] = email
            session["user_name"] = result.get("user_name", email)
            print('DEBUG: /api/login - session set for', email)
        else:
            print('DEBUG: /api/login - login failed for', email)
        return jsonify(result)
    except Exception as e:
        print(f"DEBUG: /api/login - Exception: {e}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"})


@app.route("/api/logout", methods=["POST"])
def api_logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"})


@app.route("/logout", methods=['POST'])
def logout():
    session.clear()
    return '', 204  # No Content, JS will redirect


@app.route("/api/check-auth")
def check_auth():
    # Check if user is authenticated
    if 'user_email' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'email': session['user_email'],
                'name': session.get('user_name', 'User')
            }
        })
    return jsonify({'authenticated': False})


@app.route("/api/submit-review", methods=["POST"])
@login_required
def submit_review():
    try:
        data = request.get_json()
        rating = data.get('rating')
        title = data.get('title', '')
        text = data.get('text')
        customer_title = data.get('customerTitle', '')
        
        if not rating or not text:
            return jsonify({'success': False, 'message': 'Rating and review text are required'})
        
        # Get user info from session
        user_email = session['user_email']
        user_name = session.get('user_name', 'Anonymous')
        
        # Generate avatar from email (using Gravatar-style hash)
        email_hash = hashlib.md5(user_email.lower().encode()).hexdigest()
        avatar_url = f"https://www.gravatar.com/avatar/{email_hash}?d=mp&s=100"
        
        # Create review document
        review = {
            'user_email': user_email,
            'user_name': user_name,
            'user_avatar': avatar_url,
            'customer_title': customer_title,
            'rating': int(rating),
            'title': title,
            'text': text,
            'date': datetime.now(timezone.utc),
            'approved': True  # Auto-approve for now
        }
        
        # Save to database
        db = get_db()
        reviews_collection = db['reviews']
        reviews_collection.insert_one(review)
        
        return jsonify({
            'success': True, 
            'message': 'Review submitted successfully!',
            'review': {
                'user_name': user_name,
                'user_avatar': avatar_url,
                'customer_title': customer_title,
                'rating': rating,
                'title': title,
                'text': text,
                'date': review['date'].isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error submitting review: {str(e)}'})

@app.route("/api/reviews", methods=['GET'])
def get_reviews():
    # Example: reviews = db.get_all_reviews()
    reviews = [
        {'rating': 5, 'title': 'Great!', 'text': 'Loved it!', 'customerTitle': 'Foodie'},
        # ... more reviews ...
    ]
    return jsonify({'reviews': reviews})

@app.route("/api/get-user-info")
@login_required
def get_user_info():
    try:
        user_email = session['user_email']
        user_name = session.get('user_name', 'User')
        
        # Generate avatar from email
        email_hash = hashlib.md5(user_email.lower().encode()).hexdigest()
        avatar_url = f"https://www.gravatar.com/avatar/{email_hash}?d=mp&s=100"
        
        return jsonify({
            'success': True,
            'user': {
                'email': user_email,
                'name': user_name,
                'avatar': avatar_url
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching user info: {str(e)}'})

@app.route("/api/submit-contact", methods=["POST"])
@login_required
def submit_contact():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        subject = data.get('subject')
        message = data.get('message')
        
        if not all([name, email, subject, message]):
            return jsonify({'success': False, 'message': 'All fields are required'})
        
        # Get user info from session
        user_email = session['user_email']
        user_name = session.get('user_name', 'User')
        
        # Create contact message document
        contact_message = {
            'name': name,
            'email': email,
            'subject': subject,
            'message': message,
            'user_email': user_email,
            'user_name': user_name,
            'date': datetime.now(timezone.utc),
            'status': 'new'
        }
        
        # Save to database
        db = get_db()
        contact_collection = db['contact_messages']
        contact_collection.insert_one(contact_message)
        
        # In a real application, you would send an email notification here
        # For now, we'll just log it
        print(f"New contact message from {name} ({email}): {subject}")
        
        return jsonify({
            'success': True, 
            'message': 'Message sent successfully! We\'ll get back to you soon.'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error sending message: {str(e)}'})

@app.route("/api/update_profile", methods=["POST"])
@login_required
def update_profile():
    try:
        data = request.get_json()
        full_name = data.get('full_name')
        phone = data.get('phone')
        
        if not full_name or not phone:
            return jsonify({'success': False, 'message': 'All fields are required'})
        
        # Validate phone number
        phone_clean = ''.join(filter(str.isdigit, phone))
        if len(phone_clean) != 10:
            return jsonify({'success': False, 'message': 'Please enter a valid 10-digit phone number'})
        
        # Check if phone number is already taken by another user
        user_email = session['user_email']
        db = get_db()
        users_collection = db['users']
        
        existing_user = users_collection.find_one({
            'phone': phone_clean,
            'email': {'$ne': user_email}
        })
        
        if existing_user:
            return jsonify({'success': False, 'message': 'This phone number is already registered by another user'})
        
        # Update user profile
        result = users_collection.update_one(
            {'email': user_email},
            {
                '$set': {
                    'full_name': full_name,
                    'phone': phone_clean
                }
            }
        )
        
        if result.modified_count > 0:
            # Update session
            session['user_name'] = full_name
            session.modified = True
            
            return jsonify({
                'success': True,
                'message': 'Profile updated successfully!'
            })
        else:
            return jsonify({'success': False, 'message': 'No changes were made'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error updating profile: {str(e)}'})

@app.route("/api/order_details/<order_id>")
@login_required
def order_details(order_id):
    try:
        user_email = session['user_email']
        
        # Get order from database
        db = get_db()
        orders_collection = db['orders']
        order = orders_collection.find_one({
            'order_id': order_id,
            'user_email': user_email
        })
        
        if not order:
            return jsonify({'success': False, 'message': 'Order not found'})
        
        # Generate HTML for order details
        html = f"""
        <div class="order-details-content">
            <div class="order-header-details">
                <div class="order-info-details">
                    <h3>Order #{order['order_id']}</h3>
                    <p class="order-date-details">{order['order_date'].strftime('%B %d, %Y at %I:%M %p')}</p>
                    <span class="status-badge status-{order['status']}">{order['status'].title()}</span>
                </div>
            </div>
            
            <div class="order-items-details">
                <h4>Order Items</h4>
                <div class="items-list">
        """
        
        for item in order['items']:
            html += f"""
                    <div class="item-detail">
                        <div class="item-info">
                            <span class="item-name-detail">{item['name']}</span>
                            <span class="item-quantity-detail">x{item['quantity']}</span>
                        </div>
                        <span class="item-price-detail">₹{item['price'] * item['quantity']:.2f}</span>
                    </div>
            """
        
        html += f"""
                </div>
            </div>
            
            <div class="order-summary-details">
                <div class="summary-item">
                    <span>Subtotal:</span>
                    <span>₹{order['subtotal']:.2f}</span>
                </div>
                <div class="summary-item">
                    <span>Delivery Fee:</span>
                    <span>₹{order['delivery_fee']:.2f}</span>
                </div>
                <div class="summary-item total">
                    <span>Total:</span>
                    <span>₹{order['total']:.2f}</span>
                </div>
            </div>
            
            <div class="delivery-info-details">
                <h4>Delivery Information</h4>
                <p><strong>Estimated Delivery:</strong> {order['estimated_delivery'].strftime('%B %d, %Y at %I:%M %p')}</p>
                <p><strong>Phone:</strong> {order['phone_number']}</p>
            </div>
        </div>
        """
        
        return jsonify({
            'success': True,
            'html': html
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error loading order details: {str(e)}'})

@app.route("/api/place_order", methods=["POST"])
@login_required
def place_order():
    try:
        data = request.get_json()
        total = data.get('total')
        items = data.get('items', [])
        if not items:
            return jsonify({'success': False, 'message': 'Cart is empty'})
        # Get user info from session and database
        user_email = session['user_email']
        user_name = session.get('user_name', 'User')
        db = get_db()
        users_collection = db['users']
        user = users_collection.find_one({'email': user_email})
        if not user or not user.get('phone'):
            return jsonify({'success': False, 'message': 'User info incomplete.'}), 400
        # Generate unique order ID
        order_id = f"RP{datetime.now().strftime('%Y%m%d%H%M%S')}{str(uuid.uuid4())[:8].upper()}"
        # Create order document
        order = {
            'order_id': order_id,
            'user_email': user_email,
            'user_name': user_name,
            'items': items,
            'total': total,
            'status': 'pending',
            'order_date': datetime.now(timezone.utc),
            'estimated_delivery': datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0) + timedelta(minutes=45)
        }
        # Save order to database
        orders_collection = db['orders']
        orders_collection.insert_one(order)
        # Clear cart after successful order
        session['cart'] = []
        session['cart_total'] = 0.0
        session.modified = True
        return jsonify({
            'success': True,
            'message': 'Order placed successfully!',
            'order_id': order_id
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route("/test-modal")
def test_modal():
    """Test page for the login modal"""
    return send_from_directory('.', 'test_modal.html')

@app.route("/api/get-orders")
@login_required
def get_orders():
    try:
        user_email = session['user_email']
        is_admin = user_email == 'admin@example.com'
        show_all = is_admin and request.args.get('all') == '1'
        db = get_db()
        orders_collection = db['orders']
        if show_all:
            # Admin: get all orders, include user_name and user_email
            orders = list(orders_collection.find({}, {'_id': 0}))
        else:
            # Regular user: only their orders
            orders = list(orders_collection.find(
                {'user_email': user_email},
                {'_id': 0, 'user_email': 0}
            ))
        orders.sort(key=lambda o: o.get('order_date', ''), reverse=True)
        # Convert datetime objects to strings
        for order in orders:
            if 'order_date' in order:
                order['order_date'] = order['order_date'].isoformat()
            if 'estimated_delivery' in order:
                order['estimated_delivery'] = order['estimated_delivery'].isoformat()
        for order in orders:
            if "location" not in order:
                # Set a default or fetch from your order data
                order["location"] = {"lat": 28.6139, "lng": 77.2090}
        return jsonify({'success': True, 'orders': orders})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching orders: {str(e)}'})

@app.route("/orders")
@login_required
def orders():
    user_email = session['user_email']
    is_admin = user_email == 'admin@example.com'
    return render_template("orders.html", is_admin=is_admin)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template("404.html"), 404


if __name__ == "__main__":
    # Create templates and static directories if they don't exist
    os.makedirs("templates", exist_ok=True)
    os.makedirs("static/css", exist_ok=True)
    os.makedirs("static/js", exist_ok=True)
    os.makedirs("static/images", exist_ok=True)

    app.run(debug=True, host="0.0.0.0", port=5000)
