import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Button, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions,
  CircularProgress,
  IconButton,
  Snackbar
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Favorite, Delete, AddShoppingCart } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { favoriteService, authService } from '../../services/api';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(8),
  },
  header: {
    marginBottom: theme.spacing(4),
    fontFamily: 'Poppins, sans-serif',
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    },
  },
  cardMedia: {
    paddingTop: '140%', // 7:5 aspect ratio
    backgroundSize: 'contain',
  },
  cardContent: {
    flexGrow: 1,
  },
  bookTitle: {
    fontWeight: 600,
    fontSize: '1.1rem',
    height: 48,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
  },
  bookAuthor: {
    color: '#555',
    fontStyle: 'italic',
  },
  bookPrice: {
    color: '#f1361d',
    fontWeight: 500,
  },
  cardActions: {
    justifyContent: 'space-between',
    padding: theme.spacing(1, 2),
  },
  emptyState: {
    textAlign: 'center',
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(8),
  },
  exploreButton: {
    marginTop: theme.spacing(2),
    backgroundColor: '#001524',
    color: 'white',
    '&:hover': {
      backgroundColor: '#2a344a',
    },
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: theme.spacing(4),
  },
  retryButton: {
    marginTop: theme.spacing(2),
  },
  actionButton: {
    color: 'white',
    backgroundColor: '#001524',
    '&:hover': {
      backgroundColor: '#2a344a',
    },
  },
  removeButton: {
    color: 'white',
    backgroundColor: '#f1361d',
    '&:hover': {
      backgroundColor: '#d32f2f',
    },
  },
}));

const Favorites = ({ onAddToCart }) => {
  const classes = useStyles();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!authService.isLoggedIn()) {
        setError('You must be logged in to view your favorites');
        setLoading(false);
        return;
      }
      
      // Try to access the debug endpoint first to check connection
      try {
        await favoriteService.debugFavorites();
      } catch (debugError) {
        console.error('Favorites debug error:', debugError);
        // Continue anyway - this is just for diagnostics
      }
      
      const data = await favoriteService.getUserFavorites();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Failed to load your favorites. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (bookId) => {
    try {
      await favoriteService.removeFromFavorites(bookId);
      setFavorites(favorites.filter(fav => fav.book_id !== bookId));
      setSnackbar({
        open: true,
        message: 'Book removed from favorites',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove from favorites',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleRetry = () => {
    fetchFavorites();
  };

  if (loading) {
    return (
      <div className={classes.loading}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Container className={classes.container}>
        <div className={classes.errorContainer}>
          <Alert severity="error">{error}</Alert>
          <Button 
            variant="outlined" 
            color="primary" 
            className={classes.retryButton}
            onClick={handleRetry}
          >
            Retry
          </Button>
          <Button
            component={Link}
            to="/"
            variant="text"
            color="primary"
            style={{ marginTop: 8 }}
          >
            Return to Home
          </Button>
        </div>
      </Container>
    );
  }

  if (favorites.length === 0) {
    return (
      <Container className={classes.container}>
        <div className={classes.emptyState}>
          <Typography variant="h5" gutterBottom>
            You don't have any favorite books yet
          </Typography>
          <Typography variant="body1" paragraph>
            Start exploring our collection and save your favorite books
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            className={classes.exploreButton}
          >
            Explore Books
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className={classes.container}>
      <Typography variant="h4" component="h1" className={classes.header}>
        My Favorite Books
      </Typography>

      <Grid container spacing={4}>
        {favorites.map((favorite) => (
          <Grid item key={favorite.id} xs={12} sm={6} md={4} lg={3}>
            <Card className={classes.card}>
              <Link to={`/books/${favorite.book_id}`}>
                <CardMedia
                  className={classes.cardMedia}
                  image={favorite.cover_image || 'https://via.placeholder.com/300x450?text=No+Cover'}
                  title={favorite.title}
                />
              </Link>
              <CardContent className={classes.cardContent}>
                <Typography className={classes.bookTitle} gutterBottom variant="h6" component="h2">
                  {favorite.title}
                </Typography>
                <Typography className={classes.bookAuthor} variant="body2" component="p">
                  by {favorite.author || 'Unknown'}
                </Typography>
                {favorite.price && (
                  <Typography className={classes.bookPrice} variant="body2" component="p">
                    ${favorite.price}
                  </Typography>
                )}
              </CardContent>
              <CardActions className={classes.cardActions}>
                <Button
                  size="small"
                  variant="contained"
                  className={classes.actionButton}
                  startIcon={<AddShoppingCart />}
                  onClick={() => onAddToCart(favorite.book_id, 1)}
                >
                  Add to Cart
                </Button>
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={() => handleRemoveFavorite(favorite.book_id)}
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Snackbar for notifications */}
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

export default Favorites;
