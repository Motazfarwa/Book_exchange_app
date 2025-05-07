import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Card, 
  CardActions, 
  CardContent, 
  CardMedia,
  Chip,
  TextField
} from '@material-ui/core';
import { bookService } from '../../../services/api';
import useStyles from './styles';

const CartItem = ({ item, onUpdateCartQty, onRemoveFromCart }) => {
  const classes = useStyles();
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rentalDays, setRentalDays] = useState(7); // Default 7 days for rentals

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        // Fetch the book details using the item ID
        const book = await bookService.getBookById(item.id);
        setBookDetails(book);
      } catch (error) {
        console.error('Error fetching book details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [item.id]);

  const handleUpdateCartQty = (lineItemId, newQuantity) => {
    onUpdateCartQty(lineItemId, newQuantity, item.transactionType);
  };

  const handleRemoveFromCart = () => {
    onRemoveFromCart(item.id, item.transactionType);
  };

  const handleRentalDaysChange = (event) => {
    const days = Math.max(1, parseInt(event.target.value) || 1);
    setRentalDays(days);
    
    // Update the item with the rental days
    if (item.transactionType === 'rent') {
      item.rentalDays = days;
      // Update cart item with new rental days
      onUpdateCartQty(item.id, item.quantity, item.transactionType);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Use placeholder if book details couldn't be fetched
  const title = bookDetails?.title || 'Book';
  const imageUrl = bookDetails?.cover_image || 'https://via.placeholder.com/150';
  const price = item.transactionType === 'buy' ? 
    (bookDetails?.price || 0) : 
    (bookDetails?.rent_price || 0) * rentalDays;
  
  const totalPrice = (item.quantity * price).toFixed(2);

  return (
    <Card className="cart-item">
      <CardMedia 
        image={imageUrl} 
        alt={title} 
        className={classes.media} 
        component="img"
        height="150"
      />
      <CardContent className={classes.cardContent}>
        <div className={classes.titleSection}>
          <Typography variant="h6">{title}</Typography>
          <Chip 
            label={item.transactionType === 'buy' ? 'Purchase' : 'Rental'} 
            color={item.transactionType === 'buy' ? 'primary' : 'secondary'}
            size="small"
            className={classes.transactionChip}
          />
        </div>
        
        {item.transactionType === 'rent' && (
          <div className={classes.rentalDetails}>
            <TextField
              label="Days"
              type="number"
              InputProps={{ inputProps: { min: 1 } }}
              value={rentalDays}
              onChange={handleRentalDaysChange}
              size="small"
              className={classes.daysInput}
            />
            <Typography variant="body2" className={classes.rateInfo}>
              ${bookDetails?.rent_price}/day
            </Typography>
          </div>
        )}
        
        <Typography variant="h6" color='secondary'>${totalPrice}</Typography>
      </CardContent>
      <CardActions className={classes.cardActions}>
        <div className={classes.buttons}>
          <Button 
            type="button" 
            size="small" 
            onClick={() => handleUpdateCartQty(item.id, item.quantity - 1)}
            disabled={item.quantity === 1}
          >
            -
          </Button>
          <Typography>&nbsp;{item.quantity}&nbsp;</Typography>
          <Button 
            type="button" 
            size="small" 
            onClick={() => handleUpdateCartQty(item.id, item.quantity + 1)}
          >
            +
          </Button>
        </div>
        <Button 
          className={classes.button} 
          variant="contained" 
          type="button" 
          color='secondary' 
          onClick={handleRemoveFromCart}
        >
          Remove
        </Button>
      </CardActions>
    </Card>
  );
};

export default CartItem;
