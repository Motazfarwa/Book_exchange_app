import React, { useState, useEffect } from "react";
import { CssBaseline } from "@material-ui/core";
import Products from "./components/Products/Products";
import Navbar from "./components/Navbar/Navbar";
import Cart from "./components/Cart/Cart";
import Checkout from "./components/CheckoutForm/Checkout/Checkout";
import ProductView from "./components/ProductView/ProductView";
import Manga from "./components/Manga/Manga";
import Footer from "./components/Footer/Footer";
import Fiction from "./components/Fiction/Fiction";
import Biography from "./components/Bio/Biography";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import AddBook from "./components/Books/AddBook";
import MyBooks from "./components/Books/MyBooks";
import Favorites from "./components/Books/Favorites";
import Profile from "./components/Auth/Profile";
import Exchange from "./components/Books/Exchange";
import MyExchanges from "./components/Books/MyExchanges";
import ChatList from "./components/Chat/ChatList";
import ChatRoom from "./components/Chat/ChatRoom";
import { initializeSocket, closeSocket } from "./services/socket";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { PrivateRoute, PublicRoute } from "./middleware/auth";
import { authService, bookService, cartService } from "./services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "mdbreact/dist/css/mdb.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import loadingImg from "./assets/loader.gif";
import "./style.css";
import ExchangeHistory from "./components/Books/ExchangeHistory";
import  Dashboard  from "./components/admindashboard/Dashboard";
import Payment from "./components/Payment/Payment";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const App = () => {
  const [books, setBooks] = useState([]);
  const [mangaBooks, setMangaBooks] = useState([]);
  const [fictionBooks, setFictionBooks] = useState([]);
  const [bioBooks, setBioBooks] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [cart, setCart] = useState(() => cartService.getCart());
  const [order, setOrder] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
// Your Stripe publishable key (replace with your own key)
const stripePromise = loadStripe('pk_test_51RKKT3005XouV5R4gVNvo42RgDb10F23Ijk1F3HIbm9HZaL60ynCY6RIuW0mFXvfGHw9oXGolo9ScNef7z8TxJu600nHv4OXAo');
  // Initialize cart from localStorage and user from token
  useEffect(() => {
    setCart(cartService.getCart());
    setCurrentUser(authService.getCurrentUser());
  }, []);

  // Fetch books on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all books
        const booksData = await bookService.getAllBooks();
        setBooks(booksData);
        
        // Fetch books by category
        try {
          const mangaData = await bookService.getBooksByCategory('manga');
          setMangaBooks(mangaData);
        } catch (error) {
          console.error("Error fetching manga books:", error);
          // Fallback to client-side filtering if API endpoint doesn't exist
          setMangaBooks(booksData.filter(book => book.category === 'manga'));
        }
        
        try {
          const fictionData = await bookService.getBooksByCategory('fiction');
          setFictionBooks(fictionData);
        } catch (error) {
          console.error("Error fetching fiction books:", error);
          setFictionBooks(booksData.filter(book => book.category === 'fiction'));
        }
        
        try {
          const bioData = await bookService.getBooksByCategory('biography');
          setBioBooks(bioData);
        } catch (error) {
          console.error("Error fetching biography books:", error);
          setBioBooks(booksData.filter(book => book.category === 'biography'));
        }
        
        // Set featured books (top 6 books)
        setFeaturedBooks(booksData.slice(0, 6));
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching books:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Initialize socket connection when user logs in
  useEffect(() => {
    if (currentUser) {
      const token = localStorage.getItem('token');
      if (token) {
        const socket = initializeSocket(token);
        // Log socket connection
        if (socket) {
          console.log('Socket initialized in App component');
        }
      }
    } else {
      closeSocket();
    }
    
    return () => {
      closeSocket();
    };
  }, [currentUser]);

  // Cart handling functions
  const handleAddToCart = async (productId, quantity, price, transactionType = 'buy') => {
    try {
      // Get product details first to include price information if not provided
      if (!price) {
        const product = await bookService.getBookById(productId);
        price = transactionType === 'buy' ? product.price : product.rent_price;
      }
      
      // Add to cart with product details and transaction type
      const updatedCart = cartService.addToCart(productId, quantity, price, transactionType);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleUpdateCartQty = (productId, quantity, transactionType = 'buy') => {
    const updatedCart = cartService.updateItemQuantity(productId, quantity, transactionType);
    setCart(updatedCart);
  };

  const handleRemoveFromCart = (productId, transactionType = null) => {
    const updatedCart = cartService.removeFromCart(productId, transactionType);
    setCart(updatedCart);
  };

  const handleEmptyCart = () => {
    const emptyCart = cartService.clearCart();
    setCart(emptyCart);
  };

  const handleCaptureCheckout = (checkoutTokenId, newOrder) => {
    try {
      // In a real implementation, this would talk to the backend
      setOrder(newOrder);
      handleEmptyCart();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Auth related handlers
  const handleLogin = (userData) => {
    // Make sure we're setting the user correctly
    const user = userData.user || userData;
    setCurrentUser(user);
    console.log('User logged in:', user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    console.log('User logged out');
  };

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="loader">
        <img src={loadingImg} alt="Loading" />
      </div>
    );
  }

  return (
    <Router>
      <div>
        <CssBaseline />
        <Navbar 
          totalItems={cart.total_items} 
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <Switch>
          <Route exact path="/">
            <Products
              products={books}
              featureProducts={featuredBooks}
              onAddToCart={handleAddToCart}
            />
          </Route>
          
          <Route exact path="/cart">
            <Cart
              cart={cart}
              onUpdateCartQty={handleUpdateCartQty}
              onRemoveFromCart={handleRemoveFromCart}
              onEmptyCart={handleEmptyCart}
            />
          </Route>
          
          <Route path="/checkout" exact>
            <Checkout
              cart={cart}
              order={order}
              onCaptureCheckout={handleCaptureCheckout}
              error={errorMessage}
            />
          </Route>
          
          <Route path="/books/:id" exact>
            <ProductView onAddToCart={handleAddToCart} />
          </Route>
          
          <Route path="/manga" exact>
            <Manga
              mangaProducts={mangaBooks}
              onAddToCart={handleAddToCart}
            />
          </Route>
          
          <Route path="/fiction" exact>
            <Fiction
              fictionProducts={fictionBooks}
              onAddToCart={handleAddToCart}
            />
          </Route>
          
          <Route path="/biography" exact>
            <Biography
              bioProducts={bioBooks}
              onAddToCart={handleAddToCart}
            />
          </Route>
          
          <PublicRoute path="/login" restricted={true} component={(props) => 
            <Login {...props} onLogin={handleLogin} />
          } />
          
          <PublicRoute path="/register" restricted={true} component={Register} />
          
          <PrivateRoute path="/add-book" component={AddBook} />
          <PrivateRoute path="/my-books" component={MyBooks} />
          <PrivateRoute path="/favorites" component={Favorites} />
          <PrivateRoute 
            path="/profile" 
            component={(props) => <Profile {...props} onProfileUpdate={handleProfileUpdate} />} 
          />
          <PrivateRoute path="/exchange/:id" component={Exchange} />
          <PrivateRoute path="/my-exchanges" component={MyExchanges} />
          <PrivateRoute path="/exchange-history" component={ExchangeHistory} />
          <PrivateRoute 
            path="/chat/:exchangeId" 
            component={(props) => (
              <ChatRoom {...props} key={props.match.params.exchangeId} />
            )}
          />
          <PrivateRoute path="/my-chats" component={ChatList} />
           <PrivateRoute path="/dashboard" component={Dashboard} />
           <PrivateRoute path="/payment" component={() => (
            <Elements stripe={stripePromise}>
                       <Payment />
         </Elements>
         )} />

          </Switch>
          <Footer/>
        </div>
       </Router>
      );
    };

export default App;
