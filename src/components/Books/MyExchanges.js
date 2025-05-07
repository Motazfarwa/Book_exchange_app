import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Box
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { Link, useHistory } from 'react-router-dom';
import { exchangeService, authService } from '../../services/api';
import { ArrowBack } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(12),
    marginBottom: theme.spacing(8),
  },
  paper: {
    padding: theme.spacing(3),
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  title: {
    fontFamily: 'Poppins, sans-serif',
    marginBottom: theme.spacing(3),
    fontWeight: 600,
    color: '#001524',
  },
  tableContainer: {
    marginTop: theme.spacing(2),
    borderRadius: 8,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
  },
  statusChip: {
    fontWeight: 500,
  },
  pendingChip: {
    backgroundColor: '#fff7e6',
    color: '#d46b08',
  },
  acceptedChip: {
    backgroundColor: '#e6f7ff',
    color: '#0072b3',
  },
  declinedChip: {
    backgroundColor: '#fff1f0',
    color: '#cf1322',
  },
  completedChip: {
    backgroundColor: '#f6ffed',
    color: '#52c41a',
  },
  cancelledChip: {
    backgroundColor: '#f9f0ff',
    color: '#722ed1',
  },
  actionButton: {
    margin: theme.spacing(0.5),
  },
  noExchanges: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  emptyButton: {
    backgroundColor: '#001524',
    color: 'white',
    marginTop: theme.spacing(2),
    '&:hover': {
      backgroundColor: '#2a344a',
    },
  },
  exchangeTypeCell: {
    textTransform: 'capitalize',
  },
  dateDisplay: {
    fontSize: '0.875rem',
  },
  debugInfo: {
    margin: theme.spacing(2, 0),
    padding: theme.spacing(1),
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
  }
}));

const MyExchanges = () => {
  const classes = useStyles();
  const history = useHistory();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState({ type: '', exchange: null });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!authService.isLoggedIn()) {
        setError('You must be logged in to view your exchanges');
        setLoading(false);
        return;
      }
      
      console.log("Fetching exchanges...");
      const data = await exchangeService.getUserExchanges();
      console.log("Exchanges received:", data);
      
      // For debugging
      setDebugInfo(JSON.stringify(data, null, 2));
      
      setExchanges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching exchanges:', error);
      setError(`Failed to load your exchanges: ${error.message || 'Unknown error'}`);
      setDebugInfo(error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleAction = (actionType, exchange) => {
    setCurrentAction({ type: actionType, exchange });
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    try {
      const { type, exchange } = currentAction;
      let newStatus = '';
      
      switch (type) {
        case 'accept':
          newStatus = 'accepted';
          break;
        case 'decline':
          newStatus = 'declined';
          break;
        case 'cancel':
          newStatus = 'cancelled';
          break;
        case 'complete':
          newStatus = 'completed';
          break;
        default:
          throw new Error('Invalid action type');
      }
      
      await exchangeService.updateExchangeStatus(exchange.id, newStatus);
      
      // Update the exchanges list after action
      setExchanges(prevExchanges => 
        prevExchanges.map(ex => 
          ex.id === exchange.id ? { ...ex, status: newStatus } : ex
        )
      );
      
      setSnackbar({
        open: true,
        message: `Exchange ${newStatus} successfully`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating exchange:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to update exchange',
        severity: 'error',
      });
    } finally {
      setDialogOpen(false);
      setCurrentAction({ type: '', exchange: null });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentAction({ type: '', exchange: null });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusChipClass = (status) => {
    switch (status) {
      case 'pending':
        return classes.pendingChip;
      case 'accepted':
        return classes.acceptedChip;
      case 'declined':
        return classes.declinedChip;
      case 'completed':
        return classes.completedChip;
      case 'cancelled':
        return classes.cancelledChip;
      default:
        return '';
    }
  };

  // Determine if user is the owner or requester of the exchange
  const isOwner = (exchange) => {
    const currentUser = authService.getCurrentUser();
    return currentUser && exchange.owner_id === currentUser.id;
  };

  // Show appropriate action buttons based on exchange status and user role
  const renderActionButtons = (exchange) => {
    const owner = isOwner(exchange);
    
    if (exchange.status === 'pending') {
      if (owner) {
        return (
          <>
            <Button
              variant="contained"
              size="small"
              color="primary"
              className={classes.actionButton}
              onClick={() => handleAction('accept', exchange)}
            >
              Accept
            </Button>
            <Button
              variant="contained"
              size="small"
              color="secondary"
              className={classes.actionButton}
              onClick={() => handleAction('decline', exchange)}
            >
              Decline
            </Button>
          </>
        );
      } else {
        // Requester can cancel pending requests
        return (
          <Button
            variant="contained"
            size="small"
            className={classes.actionButton}
            onClick={() => handleAction('cancel', exchange)}
          >
            Cancel
          </Button>
        );
      }
    } else if (exchange.status === 'accepted') {
      if (owner) {
        return (
          <Button
            variant="contained"
            size="small"
            color="primary"
            className={classes.actionButton}
            onClick={() => handleAction('complete', exchange)}
          >
            Mark Complete
          </Button>
        );
      } else {
        // Requester can't do anything once accepted
        return null;
      }
    }
    
    return null;
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
        <Paper className={classes.paper}>
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Exchanges
          </Typography>
          <Typography paragraph>{error}</Typography>
          
          {debugInfo && (
            <div className={classes.debugInfo}>
              <Typography variant="subtitle2" gutterBottom>Debug Information:</Typography>
              {debugInfo}
            </div>
          )}
          
          <Button
            variant="contained"
            color="primary"
            onClick={fetchExchanges}
            style={{ marginTop: 16 }}
          >
            Retry
          </Button>
          <Button
            variant="outlined"
            component={Link}
            to="/"
            style={{ marginTop: 16, marginLeft: 8 }}
          >
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!exchanges || exchanges.length === 0) {
    return (
      <Container className={classes.container}>
        <Paper className={classes.paper}>
          <div className={classes.noExchanges}>
            <Typography variant="h6" gutterBottom>
              You don't have any exchanges yet
            </Typography>
            <Typography variant="body1" paragraph>
              Start browsing the available books to rent or buy
            </Typography>
            <Button
              component={Link}
              to="/"
              variant="contained"
              className={classes.emptyButton}
            >
              Browse Books
            </Button>
          </div>
        </Paper>
      </Container>
    );
  }

  return (
    <Container className={classes.container}>
      <Paper className={classes.paper}>
        <Typography variant="h4" className={classes.title}>
          My Exchanges
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBack />}
            onClick={() => history.push('/')}
          >
            Back to Home
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={() => history.push('/exchange-history')}
          >
            View Exchange History
          </Button>
        </Box>
        
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Book</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exchanges.map((exchange) => (
                <TableRow key={exchange.id}>
                  <TableCell>
                    <Typography variant="body2">
                      <Link to={`/books/${exchange.book_id}`}>
                        {exchange.title || "Book Title"}
                      </Link>
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {exchange.owner_name ? 
                        (exchange.owner_id === authService.getCurrentUser()?.id ? 
                          `From: ${exchange.requester_name}` : 
                          `To: ${exchange.owner_name}`) : 
                        "User"}
                    </Typography>
                  </TableCell>
                  <TableCell className={classes.exchangeTypeCell}>
                    {exchange.type}
                  </TableCell>
                  <TableCell>${exchange.amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}
                      size="small"
                      className={`${classes.statusChip} ${classes[`${exchange.status}Chip`] || ''}`}
                    />
                  </TableCell>
                  <TableCell>
                    {exchange.type === 'rent' ? (
                      <div>
                        <div className={classes.dateDisplay}>
                          <strong>Start:</strong> {new Date(exchange.start_date).toLocaleDateString()}
                        </div>
                        <div className={classes.dateDisplay}>
                          <strong>End:</strong> {new Date(exchange.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <div className={classes.dateDisplay}>
                        {new Date(exchange.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {renderActionButtons(exchange)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`${currentAction.type.charAt(0).toUpperCase() + currentAction.type.slice(1)} Exchange`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {currentAction.type === 'accept' && "Are you sure you want to accept this exchange request?"}
            {currentAction.type === 'decline' && "Are you sure you want to decline this exchange request?"}
            {currentAction.type === 'cancel' && "Are you sure you want to cancel this exchange request?"}
            {currentAction.type === 'complete' && "Are you sure you want to mark this exchange as completed?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            No
          </Button>
          <Button onClick={confirmAction} color="primary" autoFocus>
            Yes
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

export default MyExchanges;
