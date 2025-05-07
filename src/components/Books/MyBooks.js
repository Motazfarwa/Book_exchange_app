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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Add, Edit, Delete } from '@material-ui/icons';
import { Link, useHistory } from 'react-router-dom';
import { bookService, authService } from '../../services/api';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(8),
  },
  header: {
    marginBottom: theme.spacing(4),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#001524',
    color: 'white',
    '&:hover': {
      backgroundColor: '#2a344a',
    },
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
  bookStatus: {
    marginTop: theme.spacing(1),
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
  emptyStateButton: {
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
  statusChip: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(0.5, 1),
    borderRadius: 12,
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  statusAvailable: {
    backgroundColor: '#e6f7ff',
    color: '#0072b3',
  },
  statusRented: {
    backgroundColor: '#fff7e6',
    color: '#d46b08',
  },
  statusSold: {
    backgroundColor: '#f9f0ff',
    color: '#722ed1',
  },
}));

const MyBooks = () => {
  const classes = useStyles();
  const history = useHistory();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchMyBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      // Check if user is authenticated
      if (!authService.isLoggedIn()) {
        setError('You must be logged in to view your books');
        setLoading(false);
        return;
      }
      
      const data = await bookService.getUserBooks();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching user books:', error);
      setError('Failed to load your books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const handleDeleteClick = (book) => {
    setBookToDelete(book);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setBookToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await bookService.deleteBook(bookToDelete.id);
      setBooks(books.filter(book => book.id !== bookToDelete.id));
      setSnackbar({
        open: true,
        message: 'Book deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting book:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete book',
        severity: 'error'
      });
    } finally {
      handleCloseDialog();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleRetry = () => {
    fetchMyBooks();
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

  if (books.length === 0) {
    return (
      <Container className={classes.container}>
        <div className={classes.emptyState}>
          <Typography variant="h5" gutterBottom>
            You haven't added any books yet
          </Typography>
          <Typography variant="body1" paragraph>
            Start sharing your book collection with others
          </Typography>
          <Button
            component={Link}
            to="/add-book"
            variant="contained"
            startIcon={<Add />}
            className={classes.emptyStateButton}
          >
            Add Your First Book
          </Button>
        </div>
      </Container>
    );
  }

  // Function to determine status display style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'available':
        return classes.statusAvailable;
      case 'rented':
        return classes.statusRented;
      case 'sold':
        return classes.statusSold;
      default:
        return '';
    }
  };

  return (
    <Container className={classes.container}>
      <div className={classes.header}>
        <Typography variant="h4" component="h1">
          My Books
        </Typography>
        <Button
          component={Link}
          to="/add-book"
          variant="contained"
          startIcon={<Add />}
          className={classes.addButton}
        >
          Add New Book
        </Button>
      </div>

      <Grid container spacing={4}>
        {books.map((book) => (
          <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
            <Card className={classes.card}>
              <CardMedia
                className={classes.cardMedia}
                image={book.cover_image || 'https://via.placeholder.com/300x450?text=No+Cover'}
                title={book.title}
              />
              <CardContent className={classes.cardContent}>
                <Typography className={classes.bookTitle} gutterBottom variant="h6" component="h2">
                  {book.title}
                </Typography>
                <Typography className={classes.bookAuthor} variant="body2" component="p">
                  by {book.author}
                </Typography>
                <Typography className={classes.bookPrice} variant="body2" component="p">
                  ${book.price}
                </Typography>
                <div className={classes.bookStatus}>
                  <span className={`${classes.statusChip} ${getStatusStyle(book.status)}`}>
                    {book.status ? book.status.charAt(0).toUpperCase() + book.status.slice(1) : 'Unknown'}
                  </span>
                </div>
              </CardContent>
              <CardActions className={classes.cardActions}>
                <Button 
                  component={Link} 
                  to={`/books/${book.id}`} 
                  size="small" 
                  color="primary"
                >
                  View
                </Button>
                <div>
                  <IconButton
                    component={Link}
                    to={`/edit-book/${book.id}`}
                    size="small"
                    color="primary"
                    aria-label="edit"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="secondary"
                    aria-label="delete"
                    onClick={() => handleDeleteClick(book)}
                  >
                    <Delete />
                  </IconButton>
                </div>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Book"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete "{bookToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default MyBooks;
