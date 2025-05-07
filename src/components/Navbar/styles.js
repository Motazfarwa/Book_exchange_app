import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  appBar: {
    boxShadow: 'none',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    [theme.breakpoints.up('sm')]: {
      width: '100%',
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
  },
  title: {
    fontFamily: 'Roboto',
    fontWeight: 600,
    color: '#001524',
    textDecoration: 'none',
    marginLeft: '10px',
    flexGrow: 0,
  },
  image: {
    marginRight: '10px',
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  navLinks: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      marginLeft: '30px',
    },
  },
  navLink: {
    margin: '0 10px',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.04)',
    },
  },
  grow: {
    flexGrow: 1,
  },
  button: {
    display: 'flex',
    alignItems: 'center',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
  },
  appsMenu: {
    marginTop: theme.spacing(1),
  },
  drawer: {
    width: 250,
    padding: theme.spacing(2),
  },
  menuIcon: {
    marginRight: theme.spacing(1),
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
  },
  registerButton: {
    marginLeft: theme.spacing(1),
  },
}));
