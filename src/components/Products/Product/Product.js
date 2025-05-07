import React, { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  CardActionArea,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@material-ui/core";
import { AddShoppingCart, Favorite, FavoriteBorder } from "@material-ui/icons";
import { Link } from "react-router-dom";
import useStyles from "./styles";
import { authService, favoriteService } from "../../../services/api";

const Product = ({ product, onAddToCart }) => {
  const classes = useStyles();
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('buy');

  // Extract cover image URL
  const imageUrl = product.cover_image || product.media?.source || 'https://via.placeholder.com/300x400?text=No+Image';
  
  // Format price with currency symbol
  const buyPrice = product.price?.formatted_with_symbol || `$${product.price || 0}`;
  const rentPrice = product.rent_price ? `$${product.rent_price}` : null;
  
  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddToCartClick = (type) => {
    handleMenuClose();
    
    if (type === 'buy') {
      onAddToCart(product.id, 1, product.price, 'buy');
    } else {
      // For rent, open dialog to confirm rental
      setTransactionType('rent');
      setDialogOpen(true);
    }
  };

  const handleConfirmRental = () => {
    onAddToCart(product.id, 1, product.rent_price, 'rent');
    setDialogOpen(false);
  };

  const handleToggleFavorite = async () => {
    if (!authService.isLoggedIn()) {
      alert("Please login to add to favorites");
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        await favoriteService.removeFromFavorites(product.id);
      } else {
        await favoriteService.addToFavorites(product.id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className={classes.root}>
        <Link to={`/books/${product.id}`}>
          <CardActionArea>
            <CardMedia
              className={classes.media}
              image={imageUrl}
              title={product.title || product.name}
            />
          </CardActionArea>
        </Link>
        <CardContent>
          <div className={classes.cardContent}>
            <p className={classes.cardContentName}>{product.title || product.name}</p>
          </div>
          <div className={classes.cardDetails}>
            <p className={classes.cardContentAuthor}>
              by {product.author || "Unknown"}
            </p>
            <p className={classes.cardContentPrice}>
              <b>{buyPrice}</b>
              {rentPrice && <span className={classes.rentPrice}> / {rentPrice} to rent</span>}
            </p>
          </div>
        </CardContent>
        <CardActions disableSpacing className={classes.cardActions}>
          <div className={classes.buttonsWrapper}>
            <Button
              variant="contained"
              className={classes.button}
              endIcon={<AddShoppingCart />}
              onClick={handleMenuClick}
              disabled={isLoading}
            >
              <b>ADD TO CART</b>
            </Button>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleAddToCartClick('buy')}>Buy - {buyPrice}</MenuItem>
              {product.is_rentable && product.rent_price > 0 && (
                <MenuItem onClick={() => handleAddToCartClick('rent')}>Rent - {rentPrice}/day</MenuItem>
              )}
            </Menu>
            <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
              <IconButton 
                className={classes.favoriteButton}
                onClick={handleToggleFavorite}
                disabled={isLoading}
              >
                {isFavorite ? <Favorite color="secondary" /> : <FavoriteBorder />}
              </IconButton>
            </Tooltip>
          </div>
        </CardActions>
      </Card>
      
      {/* Rental Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm Rental</DialogTitle>
        <DialogContent>
          <Typography>
            You are about to rent "{product.title || product.name}" at {rentPrice}/day.
          </Typography>
          <Typography variant="body2" style={{marginTop: '10px'}}>
            Note: Rental periods and details can be configured during checkout.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRental} color="primary" variant="contained">
            Add Rental to Cart
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Product;
