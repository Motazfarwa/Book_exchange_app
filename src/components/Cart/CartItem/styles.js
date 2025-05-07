import { makeStyles } from '@material-ui/core/styles';

export default makeStyles(() => ({
  media: {
    height: 0,
    paddingTop: '100%', 
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardActions: {
    justifyContent: 'space-between',
  },
  buttons: {
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    color: 'white',
    width: '100%',
    height: '40px',
  },
  titleSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  transactionChip: {
    height: '20px',
    fontSize: '0.7rem',
  },
  rentalDetails: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  daysInput: {
    width: '80px',
    marginRight: '10px',
  },
  rateInfo: {
    color: '#666',
    fontStyle: 'italic',
  }
}));
