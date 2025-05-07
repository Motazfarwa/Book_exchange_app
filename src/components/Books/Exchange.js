import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Box, 
  Divider, 
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Chip
} from '@material-ui/core';
import { useParams, useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { exchangeService, bookService, authService } from '../../services/api';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  image: {
    width: '100%',
    maxHeight: 400,
    objectFit: 'contain',
  },
  details: {
    marginTop: theme.spacing(2),
  },
  actions: {
    marginTop: theme.spacing(3),
    display: 'flex',
    justifyContent: 'flex-end',
    '& > button': {
      marginLeft: theme.spacing(2),
    },
  },
  statusChip: {
    marginLeft: theme.spacing(2),
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(5),
  },
  error: {
    marginBottom: theme.spacing(3),
  },
  card: {
    marginBottom: theme.spacing(3),
  },
  cardMedia: {
    height: 300,
    backgroundSize: 'contain',
  },
}));

const Exchange = () => {
  const classes = useStyles();
  const { id } = useParams();
  const history = useHistory();
  const [exchange, setExchange] = useState(null);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [action, setAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchExchange = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching exchange with ID: ${id}`);
        const exchangeData = await exchangeService.getExchangeById(id);
        console.log('Exchange data:', exchangeData);
        
        if (!exchangeData) {
          throw new Error('Exchange not found');
        }
        
        setExchange(exchangeData);
        
        // Fetch the book details
        if (exchangeData.book_id) {
          try {
            const bookData = await bookService.getBookById(exchangeData.book_id);
            setBook(bookData);
          } catch (bookError) {
            console.error('Error fetching book:', bookError);
            setError('Failed to load book details');
          }
        } else {
          setError('Book information not available');
        }
      } catch (err) {
        console.error('Error fetching exchange:', err);
        setError(err.message || 'Failed to load exchange details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExchange();
    }
  }, [id]);

  const handleAction = async (action) => {
    if (!exchange || !exchange.id) {
      setError('Cannot perform action: Exchange data is missing');
      return;
    }
    
    setActionLoading(true);
    setActionSuccess(null);
    setAction(action);
    
    try {
      await exchangeService.updateExchangeStatus(exchange.id, action);
      
      // Update the exchange status in the local state
      setExchange(prev => ({
        ...prev,
        status: action
      }));
      
      setActionSuccess(`Exchange successfully ${action}`);
      
      // Wait a bit before redirecting or taking another action
      setTimeout(() => {
        // Optionally redirect to another page
        if (action === 'accepted' || action === 'declined') {
          history.push('/my-exchanges');
        }
      }, 2000);
    } catch (err) {
      console.error(`Error ${action} exchange:`, err);
      setError(`Failed to ${action} exchange: ${err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Paper className={classes.paper}>
          <Alert severity="error" className={classes.error}>
            {error}
          </Alert>
          <Button variant="contained" color="primary" onClick={() => history.push('/my-exchanges')}>
            Back to My Exchanges
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!exchange) {
    return (
      <Container>
        <Paper className={classes.paper}>
          <Alert severity="warning">Exchange not found</Alert>
          <Button variant="contained" color="primary" onClick={() => history.push('/my-exchanges')}>
            Back to My Exchanges
          </Button>
        </Paper>
      </Container>
    );
  }

  const isOwner = currentUser.id === exchange.owner_id;
  const isRequester = currentUser.id === exchange.requester_id;
  const isPending = exchange.status === 'pending';
  const isAccepted = exchange.status === 'accepted';
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return { label: 'Pending', color: 'default' };
      case 'accepted': return { label: 'Accepted', color: 'primary' };
      case 'declined': return { label: 'Declined', color: 'secondary' };
      case 'cancelled': return { label: 'Cancelled', color: 'default' };
      case 'completed': return { label: 'Completed', color: 'primary' };
      default: return { label: status, color: 'default' };
    }
  };

  const statusInfo = getStatusLabel(exchange.status);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Container className={classes.root}>
      <Paper className={classes.paper}>
        <Typography variant="h4" className={classes.header}>
          {exchange.type === 'rent' ? 'Rental Request' : 'Purchase Request'}
          <Chip 
            label={statusInfo.label} 
            color={statusInfo.color} 
            className={classes.statusChip} 
          />
        </Typography>
        
        {actionSuccess && (
          <Alert severity="success" className={classes.error}>
            {actionSuccess}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" className={classes.error}>
            {error}
          </Alert>
        )}
        
        {book && (
          <Card className={classes.card}>
            <CardMedia
              className={classes.cardMedia}
              image={book.cover_image || 'https://via.placeholder.com/300x450?text=No+Cover+Image'}
              title={book.title}
            />
            <CardContent>
              <Typography variant="h5" component="h2">{book.title}</Typography>
              <Typography variant="subtitle1" color="textSecondary">{book.author}</Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                {book.description}
              </Typography>
              <Box mt={2}>
                <Typography variant="subtitle2">
                  Condition: {book.condition || 'Not specified'}
                </Typography>
                {exchange.type === 'buy' ? (
                  <Typography variant="subtitle2">
                    Price: ${book.price || 'N/A'}
                  </Typography>
                ) : (
                  <>
                    <Typography variant="subtitle2">
                      Rental Price: ${book.rent_price || 'N/A'}/day
                    </Typography>
                    <Typography variant="subtitle2">
                      Rental Period: {formatDate(exchange.start_date)} to {formatDate(exchange.end_date)}
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        )}
        
        <Grid container spacing={3} className={classes.details}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Request Details</Typography>
            <Divider />
            <Box mt={2}>
              <Typography variant="body1">
                <strong>Type:</strong> {exchange.type === 'rent' ? 'Rental' : 'Purchase'}
              </Typography>
              {exchange.type === 'rent' && (
                <>
                  <Typography variant="body1">
                    <strong>Start Date:</strong> {formatDate(exchange.start_date)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>End Date:</strong> {formatDate(exchange.end_date)}
                  </Typography>
                </>
              )}
              <Typography variant="body1">
                <strong>Amount:</strong> ${exchange.price || '0.00'}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong> {exchange.status}
              </Typography>
              <Typography variant="body1">
                <strong>Created:</strong> {formatDate(exchange.created_at)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Participants</Typography>
            <Divider />
            <Box mt={2}>
              <Typography variant="body1">
                <strong>Owner:</strong> {exchange.owner_name || 'Unknown'}
              </Typography>
              <Typography variant="body1">
                <strong>Requester:</strong> {exchange.requester_name || 'Unknown'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box className={classes.actions}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => history.push('/my-exchanges')}
          >
            Back
          </Button>
          
          {/* Actions for Owner */}
          {isOwner && isPending && (
            <>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleAction('declined')}
                disabled={actionLoading}
              >
                {actionLoading && action === 'declined' ? <CircularProgress size={24} /> : 'Decline'}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleAction('accepted')}
                disabled={actionLoading}
              >
                {actionLoading && action === 'accepted' ? <CircularProgress size={24} /> : 'Accept'}
              </Button>
            </>
          )}
          
          {/* Actions for Owner - Complete Exchange */}
          {isOwner && isAccepted && exchange.type === 'rent' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleAction('completed')}
              disabled={actionLoading}
            >
              {actionLoading && action === 'completed' ? <CircularProgress size={24} /> : 'Mark as Completed'}
            </Button>
          )}
          
          {/* Actions for Requester */}
          {isRequester && isPending && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleAction('cancelled')}
              disabled={actionLoading}
            >
              {actionLoading && action === 'cancelled' ? <CircularProgress size={24} /> : 'Cancel Request'}
            </Button>
          )}
          
          {/* Chat Button - Available to both parties if exchange is not cancelled/declined */}
          {(exchange.status !== 'cancelled' && exchange.status !== 'declined') && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.push(`/chat/${exchange.id}`)}
            >
              Chat
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Exchange;
