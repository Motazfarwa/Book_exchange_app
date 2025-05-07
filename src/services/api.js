import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Create the API client with proper auth headers
const createApiClient = () => {
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add auth token to requests if available
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle response errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API error:', error);
      if (error.response && error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient();

// Add authorization header to requests when token exists
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized responses by logging out the user
    if (error.response && error.response.status === 401) {
      // Clear stored tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API service for books
export const bookService = {
  // Get all books
  getAllBooks: async () => {
    try {
      const response = await apiClient.get('/books');
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  // Get book by ID
  getBookById: async (id) => {
    try {
      const response = await apiClient.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching book ${id}:`, error);
      throw error;
    }
  },

  // Create new book
  createBook: async (bookData) => {
    try {
      const response = await apiClient.post('/books', bookData);
      return response.data;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  // Update book
  updateBook: async (id, bookData) => {
    try {
      const response = await apiClient.put(`/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      console.error(`Error updating book ${id}:`, error);
      throw error;
    }
  },

  // Delete book
  deleteBook: async (id) => {
    try {
      const response = await apiClient.delete(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting book ${id}:`, error);
      throw error;
    }
  },

  // Search books
  searchBooks: async (query) => {
    try {
      const response = await apiClient.get(`/books/search?query=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  },

  // Get books by category
  getBooksByCategory: async (category) => {
    try {
      console.log(`Fetching books in category: ${category}`);
      const response = await apiClient.get(`/books/category/${category}`);
      console.log(`Retrieved ${response.data.length} books in category ${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching books by category ${category}:`, error);
      // Return empty array on error instead of throwing
      return [];
    }
  },

  // Get user's books
  getUserBooks: async () => {
    try {
      const response = await apiClient.get('/books/my-books');
      return response.data;
    } catch (error) {
      console.error('Error fetching user books:', error);
      throw error;
    }
  }
};

// API service for user authentication
export const authService = {
  // Register user
  register: async (userData) => {
    try {
      
      
        const response = await apiClient.post('/users/register', userData);
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
      
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('Attempting login with:', credentials);
      
      // Try the user routes endpoint first
      
        const response = await apiClient.post('/users/login', credentials);
        console.log('Login response from user routes:', response.data);
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          console.log('Login response from legacy route:', response.data);
          const userData = {
            id: response.data.userId || response.data.user?.id || 'unknown',
            role: response.data.role || 'user',
            email: credentials.email
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          
        }
        return response.data;
      
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await apiClient.put('/users/profile', userData);
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};

// API service for favorites
export const favoriteService = {
  // Get user's favorites
  getUserFavorites: async () => {
    try {
      const response = await apiClient.get('/favorites');
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  // Debug favorites connection
  debugFavorites: async () => {
    try {
      const response = await apiClient.get('/favorites/debug');
      console.log('Favorites debug info:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error with favorites debug:', error);
      throw error;
    }
  },

  // Add to favorites
  addToFavorites: async (bookId) => {
    try {
      const response = await apiClient.post(`/favorites/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  },

  // Remove from favorites
  removeFromFavorites: async (bookId) => {
    try {
      const response = await apiClient.delete(`/favorites/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  },

  // Check if book is in favorites
  checkFavorite: async (bookId) => {
    try {
      const response = await apiClient.get(`/favorites/check/${bookId}`);
      return response.data.isFavorite;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false; // Default to false if there's an error
    }
  }
};

// Exchange service for book rentals and purchases
export const exchangeService = {
  // Get all exchanges for current user
  getUserExchanges: async () => {
    try {
      console.log("Making API request to /exchanges/my-exchanges");
      const response = await apiClient.get('/exchanges/my-exchanges');
      console.log("Response received:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user exchanges:', error);
      throw error;
    }
  },
  
  // Get exchange by ID
  getExchangeById: async (id) => {
    try {
      console.log(`Fetching exchange data for ID: ${id}`);
      const response = await apiClient.get(`/exchanges/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching exchange ${id}:`, error);
      throw error;
    }
  },
  
  // Create new exchange (rent or buy)
  createExchange: async (exchangeData) => {
    try {
      console.log('Creating exchange with data:', exchangeData);
      
      // Make sure book_id is present
      if (!exchangeData.book_id) {
        throw new Error('Book ID is required');
      }
      
      // Make sure type is valid
      if (!exchangeData.type || (exchangeData.type !== 'rent' && exchangeData.type !== 'buy')) {
        throw new Error('Type must be either "rent" or "buy"');
      }
      
      // Ensure amount is a valid number
      const amount = parseFloat(exchangeData.amount) || 0;
      
      // Format dates properly
      if (exchangeData.start_date) {
        try {
          const startDate = new Date(exchangeData.start_date);
          if (isNaN(startDate.getTime())) throw new Error('Invalid start date');
          exchangeData.start_date = startDate.toISOString();
        } catch (e) {
          const now = new Date();
          exchangeData.start_date = now.toISOString();
        }
      }
      
      if (exchangeData.end_date) {
        try {
          const endDate = new Date(exchangeData.end_date);
          if (isNaN(endDate.getTime())) throw new Error('Invalid end date');
          exchangeData.end_date = endDate.toISOString();
        } catch (e) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 7);
          exchangeData.end_date = endDate.toISOString();
        }
      }
      
      // Clean up the data object for the API call
      const apiData = {
        ...exchangeData,
        amount: amount
      };
      
      console.log('Sending exchange data to server:', apiData);
      
      const response = await apiClient.post('/exchanges', apiData);
      console.log('Exchange created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating exchange:', error);
      if (error.response) {
        console.error('Server error response:', error.response.data);
      }
      throw error;
    }
  },
  
  // Update exchange status (accept, decline, cancel, complete)
  updateExchangeStatus: async (exchangeId, status) => {
    try {
      const response = await apiClient.patch(`/exchanges/${exchangeId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating exchange status:', error);
      throw error;
    }
  },
  
  // Get all exchanges for the current user
  getMyExchanges: async () => {
    try {
      const response = await apiClient.get('/exchanges/my-exchanges');
      return response.data;
    } catch (error) {
      console.error('Error fetching user exchanges:', error);
      return [];
    }
  },

  // Get exchange history
  getExchangeHistory: async () => {
    try {
      console.log('Fetching exchange history');
      const response = await apiClient.get('/exchanges/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching exchange history:', error);
      return [];
    }
  }
};

// Cart service (client-side implementation)
export const cartService = {
  // Get cart from localStorage
  getCart: () => {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      return JSON.parse(cartData);
    }
    return { items: [], total_items: 0 };
  },

  // Save cart to localStorage
  saveCart: (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  },

  // Add item to cart
  addToCart: (productId, quantity, price = 0, transactionType = 'buy') => {
    const cart = cartService.getCart();
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.id === productId && item.transactionType === transactionType
    );
    
    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item if it doesn't exist (include price info and transaction type)
      cart.items.push({ 
        id: productId, 
        quantity, 
        price, 
        transactionType // 'buy' or 'rent'
      });
    }
    
    // Update total items
    cart.total_items = cart.items.reduce((total, item) => total + item.quantity, 0);
    
    return cartService.saveCart(cart);
  },

  // Update item quantity
  updateItemQuantity: (productId, quantity, transactionType = 'buy') => {
    const cart = cartService.getCart();
    
    // Find the item
    const existingItemIndex = cart.items.findIndex(item => 
      item.id === productId && item.transactionType === transactionType
    );
    
    if (existingItemIndex !== -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity = quantity;
      
      // Update total items
      cart.total_items = cart.items.reduce((total, item) => total + item.quantity, 0);
      
      return cartService.saveCart(cart);
    }
    
    return cart;
  },

  // Remove item from cart
  removeFromCart: (productId, transactionType = null) => {
    const cart = cartService.getCart();
    
    // Filter out the item (by ID and transaction type if specified)
    cart.items = cart.items.filter(item => {
      if (transactionType) {
        return !(item.id === productId && item.transactionType === transactionType);
      }
      return item.id !== productId;
    });
    
    // Update total items
    cart.total_items = cart.items.reduce((total, item) => total + item.quantity, 0);
    
    return cartService.saveCart(cart);
  },

  // Clear cart
  clearCart: () => {
    const emptyCart = { items: [], total_items: 0 };
    return cartService.saveCart(emptyCart);
  }
};

// Notification service
export const notificationService = {
  // Get user's notifications, optionally filtered by type
  getNotifications: async (type = null) => {
    try {
      let url = '/users/notifications';
      if (type) {
        url += `?type=${type}`;
      }
      const response = await apiClient.get(url);
      console.log(`Notifications response (${type || 'all'})`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notifications (${type || 'all'}):`, error);
      return [];
    }
  },
  
  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.post(`/users/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  // Mark all notifications as read, optionally filtered by type
  markAllAsRead: async (type = null) => {
    try {
      let url = '/users/notifications/read-all';
      if (type) {
        url += `?type=${type}`;
      }
      const response = await apiClient.post(url);
      return response.data;
    } catch (error) {
      console.error(`Error marking all notifications as read (${type || 'all'}):`, error);
      throw error;
    }
  }
};

// Chat service
export const chatService = {
  // Get all chats for current user
  getChats: async () => {
    try {
      const response = await apiClient.get('/chat/list');
      return response.data;
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  },
  
  // Get chat messages for a specific exchange
  getChatMessages: async (exchangeId) => {
    try {
      const response = await apiClient.get(`/chat/${exchangeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  },
  
  // Send a new message
  sendMessage: async (messageData) => {
    try {
      const response = await apiClient.post('/chat', messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};

export default {
  book: bookService,
  auth: authService,
  favorite: favoriteService,
  exchange: exchangeService,
  cart: cartService,
  notification: notificationService,
  chat: chatService
};
