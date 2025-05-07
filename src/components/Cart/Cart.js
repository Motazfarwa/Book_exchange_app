import React from 'react';
import { Container, Typography, Button, Grid } from '@material-ui/core';
import { Link, useHistory } from 'react-router-dom';

import CartItem from './CartItem/CartItem';
import useStyles from './styles';
import { authService, exchangeService, bookService } from '../../services/api';

const Cart = ({ cart, onUpdateCartQty, onRemoveFromCart, onEmptyCart }) => {
  const classes = useStyles();
  const history = useHistory();
  const currentUser = authService.getCurrentUser();

  const handleEmptyCart = () => onEmptyCart();

  const handleCheckout = async () => {
    if (!authService.isLoggedIn()) {
      alert("Please login to checkout");
      history.push("/login");
      return;
    }

    try {
      console.log("Starting checkout process with cart items:", cart.items);
      
      // For each item in cart, create an exchange record
      let successCount = 0;
      let errorCount = 0;
      let lastError = null;
      
      for (const item of cart.items) {
        try {
          console.log(`Processing item: ${JSON.stringify(item)}`);
          
          const bookDetails = await bookService.getBookById(item.id);
          
          if (!bookDetails) {
            console.error(`Book with ID ${item.id} not found`);
            errorCount++;
            continue;
          }
          
          console.log(`Got book details: ${JSON.stringify(bookDetails)}`);

          // Skip if the current user is the book owner
          if (bookDetails.owner_id === currentUser.id) {
            console.log(`Skipping own book: ${bookDetails.title}`);
            continue;
          }

          const today = new Date();
          const endDate = new Date();
          // For rentals, use the rental days from cart item or default to 7 days
          const rentalDays = item.rentalDays || 7;
          endDate.setDate(today.getDate() + rentalDays);

          // Ensure price is a proper number before multiplying
          const itemPrice = parseFloat(item.price) || 0;
          const totalAmount = itemPrice * item.quantity;
          
          // Create exchange record
          const exchangeData = {
            book_id: item.id,
            type: item.transactionType || 'buy',
            amount: totalAmount,
            start_date: today.toISOString(),
            end_date: endDate.toISOString()
          };

          console.log('Creating exchange with data:', exchangeData);
          
          const exchangeResult = await exchangeService.createExchange(exchangeData);
          console.log('Exchange created successfully:', exchangeResult);
          
          successCount++;
        } catch (itemError) {
          console.error(`Error processing item ${item.id}:`, itemError);
          console.error('Error details:', itemError.response?.data || itemError.message);
          lastError = itemError;
          errorCount++;
        }
      }

      // Only empty cart if at least one item was processed successfully
      if (successCount > 0) {
        onEmptyCart();
      }
      
      // Redirect to exchanges page if any were created successfully
      if (successCount > 0) {
        history.push('/my-exchanges');
      }
      
      if (errorCount > 0) {
        const errorMessage = lastError?.response?.data?.details || 
                             lastError?.response?.data?.error || 
                             lastError?.message || 
                             'Unknown error';
        
        alert(`Checkout complete! ${successCount} requests have been sent to the book owners. ${errorCount} items failed to process. Error: ${errorMessage}`);
      } else if (successCount > 0) {
        alert("Checkout complete! Your requests have been sent to the book owners.");
      } else {
        alert("No items were processed. Please check your cart and try again.");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert(`There was an error during checkout: ${error.response?.data?.error || error.message}`);
    }
  };

  const renderEmptyCart = () => (
    <Typography variant="subtitle1">You have no items in your shopping cart,
      <Link className={classes.link} to="/"> start adding some</Link>!
    </Typography>
  );

  if (!cart.items) return 'Loading';

  // Calculate total price of all items in cart
  const subtotal = cart.items.reduce((total, item) => {
    // For each item in cart, fetch the corresponding book from the books array
    return total + (item.quantity * (item.price || 0));
  }, 0);

  const renderCart = () => (
    <>
      <Grid container spacing={4}>
        {cart.items.map((item) => (
          <Grid item xs={12} sm={4} key={item.id}>
            <CartItem 
              item={item} 
              onUpdateCartQty={onUpdateCartQty} 
              onRemoveFromCart={onRemoveFromCart} 
            />
          </Grid>
        ))}
      </Grid>
      <div className={classes.cardDetails}>
        <Typography variant="h5">Subtotal: <b>${subtotal.toFixed(2)}</b></Typography>
        <div>
          <Button 
            className={classes.emptyButton} 
            size="large" 
            type="button" 
            variant="contained" 
            color="secondary" 
            onClick={handleEmptyCart}
          >
            Empty cart
          </Button>
          <Button 
            className={classes.checkoutButton}
            size="large" 
            type="button" 
            variant="contained"
            onClick={handleCheckout}
          >
            Checkout
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <Container>
      <div className={classes.toolbar} />
      <Typography className={classes.title} variant="h5" gutterBottom><b>Your Shopping Cart</b></Typography>
      <hr />
      {!cart.items.length ? renderEmptyCart() : renderCart()}
    </Container>
  );
};

export default Cart;
