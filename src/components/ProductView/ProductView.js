import React, { useState, useEffect } from "react";
import { 
  Container, 
  Grid, 
  Button, 
  Typography, 
  CircularProgress,
  Chip,
  IconButton,
  Snackbar,
  Paper 
} from "@material-ui/core";
import { Link, useParams } from "react-router-dom";
import { Alert } from "@material-ui/lab";
import { 
  AddShoppingCart, 
  Favorite, 
  FavoriteBorder, 
  ArrowBack 
} from "@material-ui/icons";
import { bookService, favoriteService, authService } from "../../services/api";
import "./style.css";

const createMarkup = (text) => {
  return { __html: text };
};

const ProductView = ({ onAddToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await bookService.getBookById(id);
        setProduct(data);
        
        // Check favorite status if user is logged in
        if (authService.isLoggedIn()) {
          const favStatus = await favoriteService.checkFavorite(id);
          setIsFavorite(favStatus);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Could not load book details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!authService.isLoggedIn()) {
      setSnackbar({
        open: true,
        message: 'Please login to add to favorites',
        severity: 'info'
      });
      return;
    }

    try {
      if (isFavorite) {
        await favoriteService.removeFromFavorites(id);
        setSnackbar({
          open: true,
          message: 'Removed from favorites',
          severity: 'success'
        });
      } else {
        await favoriteService.addToFavorites(id);
        setSnackbar({
          open: true,
          message: 'Added to favorites',
          severity: 'success'
        });
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update favorites',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const renderExchangeButtons = () => {
    if (!product) return null;
    
    const isAvailable = product.status === 'available';
    const isLoggedIn = authService.isLoggedIn();
    const isOwnBook = isLoggedIn && authService.getCurrentUser().id === product.owner_id;
    
    if (!isAvailable) {
      return (
        <Typography variant="body2" color="error" style={{ marginTop: 16 }}>
          This book is currently {product.status}.
        </Typography>
      );
    }
    
    if (isOwnBook) {
      return (
        <Typography variant="body2" style={{ marginTop: 16 }}>
          This is your book.
        </Typography>
      );
    }
    
    if (!isLoggedIn) {
      return (
        <Button
          component={Link}
          to="/login"
          variant="contained"
          color="primary"
          style={{ marginTop: 16 }}
        >
          Login to Rent or Buy
        </Button>
      );
    }
    
    return (
      <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
        {product.is_sellable && (
          <Button
            component={Link}
            to={`/exchange/${product.id}`}
            variant="contained"
            color="primary"
          >
            Rent or Buy
          </Button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="product-view-loading">
        <CircularProgress />
        <Typography variant="body1" style={{ marginTop: 16 }}>
          Loading book details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="product-view-error">
        <Alert severity="error">{error}</Alert>
        <Button
          component={Link}
          to="/"
          variant="outlined"
          startIcon={<ArrowBack />}
          style={{ marginTop: 16 }}
        >
          Back to Books
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="product-view-error">
        <Alert severity="warning">Book not found</Alert>
        <Button
          component={Link}
          to="/"
          variant="outlined"
          startIcon={<ArrowBack />}
          style={{ marginTop: 16 }}
        >
          Back to Books
        </Button>
      </Container>
    );
  }

  // Format the image source for display
  const imageSrc = product.cover_image || product.media?.source || 'https://via.placeholder.com/600x800?text=No+Image';
  
  // Format price
  const price = product.price?.formatted_with_symbol || `$${product.price || 0}`;

  return (
    <Container className="product-view">
      <Button
        component={Link}
        to="/"
        className="back-button"
        startIcon={<ArrowBack />}
      >
        Back to Books
      </Button>
      
      <Paper elevation={3} className="product-details-container">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6} className="image-wrapper">
            <img src={imageSrc} alt={product.title || product.name} />
            <div className="book-badges">
              {product.is_rentable && (
                <Chip 
                  label="Available for Rent" 
                  className="book-badge rental"
                  size="small"
                />
              )}
              {product.condition && (
                <Chip 
                  label={`Condition: ${product.condition}`} 
                  className="book-badge condition"
                  size="small"
                />
              )}
            </div>
          </Grid>
          
          <Grid item xs={12} md={6} className="text">
            <div className="title-section">
              <Typography variant="h2" className="book-title">
                {product.title || product.name}
              </Typography>
              <IconButton 
                className="favorite-button"
                onClick={handleToggleFavorite}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite ? (
                  <Favorite className="favorite-icon active" />
                ) : (
                  <FavoriteBorder className="favorite-icon" />
                )}
              </IconButton>
            </div>
            
            <Typography variant="h6" className="book-author">
              by {product.author || "Unknown author"}
            </Typography>
            
            <Typography
              variant="body1"
              className="book-description"
              dangerouslySetInnerHTML={createMarkup(product.description)}
            />
            
            <Typography variant="h5" className="book-price">
              Price: <strong>{price}</strong>
            </Typography>
            
            {product.rent_price && (
              <Typography variant="body1" className="book-rent-price">
                Rent for: <strong>${product.rent_price}</strong>
              </Typography>
            )}
            
            <div className="action-buttons">
              <Button
                size="large"
                className="custom-button cart-button"
                onClick={() => {
                  onAddToCart(product.id, 1);
                  setSnackbar({
                    open: true,
                    message: 'Added to cart',
                    severity: 'success'
                  });
                }}
                startIcon={<AddShoppingCart />}
              >
                Add to Cart
              </Button>
              
              <Button
                size="large"
                className="custom-button continue-button"
                component={Link}
                to="/"
              >
                Continue Shopping
              </Button>
            </div>
            
            {product.isbn && (
              <Typography variant="body2" className="book-isbn">
                ISBN: {product.isbn}
              </Typography>
            )}
            {renderExchangeButtons()}
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductView;
