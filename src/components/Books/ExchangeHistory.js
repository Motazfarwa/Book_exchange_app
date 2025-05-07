import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Box
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { exchangeService, authService } from '../../services/api';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  statusChip: {
    margin: theme.spacing(0.5),
  },
  completed: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  rejected: {
    backgroundColor: '#f44336',
    color: 'white',
  },
  cancelled: {
    backgroundColor: '#ff9800',
    color: 'white',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  backButton: {
    marginTop: theme.spacing(2),
  },
  typeChip: {
    margin: theme.spacing(0.5),
  },
  buy: {
    backgroundColor: '#3f51b5',
    color: 'white',
  },
  rent: {
    backgroundColor: '#9c27b0',
    color: 'white',
  },
}));

const ExchangeHistory = () => {
  const classes = useStyles();
  const history = useHistory();
  const [exchangeHistory, setExchangeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchExchangeHistory = async () => {
      try {
        setLoading(true);
        const history = await exchangeService.getExchangeHistory();
        console.log('Exchange history:', history);
        setExchangeHistory(history);
      } catch (err) {
        console.error('Error fetching exchange history:', err);
        setError('Failed to load exchange history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeHistory();
  }, []);

  const getStatusChipClass = (status) => {
    switch (status) {
      case 'completed':
        return classes.completed;
      case 'rejected':
        return classes.rejected;
      case 'cancelled':
        return classes.cancelled;
      default:
        return '';
    }
  };

  const getTypeChipClass = (type) => {
    switch (type) {
      case 'buy':
        return classes.buy;
      case 'rent':
        return classes.rent;
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getUserRole = (exchange) => {
    if (!currentUser) return 'Unknown';
    return exchange.owner_id === currentUser.id ? 'Owner' : 'Requester';
  };

  const getPartnerName = (exchange) => {
    if (!currentUser) return 'Unknown';
    return exchange.owner_id === currentUser.id 
      ? exchange.requester_name 
      : exchange.owner_name;
  };

  if (loading) {
    return (
      <Container className={classes.container}>
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={classes.container}>
        <Paper className={classes.paper}>
          <Typography variant="h6" color="error">{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => history.push('/')} 
            className={classes.backButton}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container className={classes.container}>
      <Paper className={classes.paper}>
        <Typography variant="h4" className={classes.title}>
          Exchange History
        </Typography>
        
        {exchangeHistory.length === 0 ? (
          <Box className={classes.emptyState}>
            <Typography variant="h6">
              You don't have any completed exchanges yet.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => history.push('/my-exchanges')} 
              className={classes.backButton}
            >
              View Active Exchanges
            </Button>
          </Box>
        ) : (
          <TableContainer component={Paper} className={classes.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Book</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Your Role</TableCell>
                  <TableCell>With</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Completed On</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exchangeHistory.map((exchange) => (
                  <TableRow key={exchange.id}>
                    <TableCell>{exchange.book_title}</TableCell>
                    <TableCell>
                      <Chip 
                        label={exchange.type === 'buy' ? 'Purchase' : 'Rental'} 
                        size="small" 
                        className={`${classes.typeChip} ${getTypeChipClass(exchange.type)}`}
                      />
                    </TableCell>
                    <TableCell>{getUserRole(exchange)}</TableCell>
                    <TableCell>{getPartnerName(exchange)}</TableCell>
                    <TableCell>${parseFloat(exchange.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)} 
                        size="small" 
                        className={`${classes.statusChip} ${getStatusChipClass(exchange.status)}`}
                      />
                    </TableCell>
                    <TableCell>{formatDate(exchange.completion_date)}</TableCell>
                    <TableCell>{exchange.notes || 'No notes'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default ExchangeHistory;
