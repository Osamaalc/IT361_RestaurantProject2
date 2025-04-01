-- Create the database
CREATE DATABASE IF NOT EXISTS university_restaurant;
USE university_restaurant;

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
                                     user_id INT AUTO_INCREMENT PRIMARY KEY,
                                     username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- Will store hashed password
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create Orders table
-- Modify Orders table to include pickup time and notes
CREATE TABLE IF NOT EXISTS orders (
                                      order_id INT AUTO_INCREMENT PRIMARY KEY,
                                      user_id INT NOT NULL,
                                      items TEXT NOT NULL,  -- Will store JSON formatted items list
                                      total_price DECIMAL(10,2) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pickup_time VARCHAR(100) NOT NULL,
    notes TEXT,
    status ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    );

-- Create Menu Categories table
CREATE TABLE IF NOT EXISTS categories (
                                          category_id INT AUTO_INCREMENT PRIMARY KEY,
                                          name VARCHAR(50) NOT NULL,
    description TEXT
    );

-- Create Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
                                          item_id INT AUTO_INCREMENT PRIMARY KEY,
                                          category_id INT NOT NULL,
                                          name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_path VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
    );

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
                                               ('Main Dishes', 'Hearty meals to satisfy your appetite'),
                                               ('Sandwiches', 'Quick and delicious options for busy students'),
                                               ('Salads', 'Fresh and healthy choices'),
                                               ('Desserts', 'Sweet treats to brighten your day'),
                                               ('Beverages', 'Refreshing drinks to quench your thirst');

-- Insert sample menu items
INSERT INTO menu_items (category_id, name, description, price, image_path) VALUES
                                                                               (1, 'Grilled Chicken', 'Tender grilled chicken breast with roasted vegetables and rice', 12.99, 'grilled_chicken.jpg'),
                                                                               (1, 'Beef Steak', 'Juicy beef steak with mashed potatoes and gravy', 15.99, 'beef_steak.jpg'),
                                                                               (1, 'Vegetable Pasta', 'Pasta with mixed vegetables in creamy sauce', 10.99, 'vegetable_pasta.jpg'),
                                                                               (2, 'Club Sandwich', 'Triple-decker sandwich with chicken, bacon, lettuce, and tomato', 8.99, 'club_sandwich.jpg'),
                                                                               (2, 'Veggie Wrap', 'Fresh vegetables and hummus wrapped in a tortilla', 7.99, 'veggie_wrap.jpg'),
                                                                               (3, 'Caesar Salad', 'Romaine lettuce, croutons, parmesan cheese with Caesar dressing', 6.99, 'caesar_salad.jpg'),
                                                                               (3, 'Greek Salad', 'Tomatoes, cucumbers, olives, feta cheese with olive oil dressing', 7.99, 'greek_salad.jpg'),
                                                                               (4, 'Chocolate Cake', 'Rich chocolate cake with a scoop of vanilla ice cream', 5.99, 'chocolate_cake.jpg'),
                                                                               (4, 'Fruit Parfait', 'Fresh seasonal fruits with yogurt and granola', 4.99, 'fruit_parfait.jpg'),
                                                                               (5, 'Fresh Orange Juice', 'Freshly squeezed orange juice', 3.99, 'orange_juice.jpg'),
                                                                               (5, 'Coffee', 'Freshly brewed coffee', 2.99, 'coffee.jpg'),
                                                                               (5, 'Iced Tea', 'Sweet or unsweetened iced tea', 2.49, 'iced_tea.jpg');