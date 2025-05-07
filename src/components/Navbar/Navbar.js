import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Badge, 
  MenuItem, 
  Menu, 
  Typography,
  Button,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Container
} from '@material-ui/core';
import { 
  ShoppingCart, 
  AccountCircle, 
  Bookmark, 
  LibraryBooks, 
  Add, 
  ExitToApp,
  Menu as MenuIcon,
  Person,
  Home,
  MenuBook,
  SwapHoriz,
  History
} from '@material-ui/icons';
import { Link, useHistory, useLocation } from 'react-router-dom';
import useStyles from './styles';
import NotificationBell from '../Notifications/NotificationBell';
import MessageNotificationBell from '../Notifications/MessageNotificationBell';

const Navbar = ({ totalItems, currentUser, onLogout }) => {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);
  const isUserMenuOpen = Boolean(userMenuAnchorEl);

  // Check login status whenever currentUser changes
  useEffect(() => {
    setIsLoggedIn(!!currentUser);
  }, [currentUser]);

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    onLogout();
    handleUserMenuClose();
    history.push('/');
  };

  const handleNavigate = (path) => {
    history.push(path);
    handleUserMenuClose();
    setDrawerOpen(false);
  };

  const renderUserMenu = (
    <Menu
      anchorEl={userMenuAnchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isUserMenuOpen}
      onClose={handleUserMenuClose}
    >
      <MenuItem onClick={() => handleNavigate('/profile')}>
        <ListItemIcon>
          <Person fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </MenuItem>
      <MenuItem onClick={() => handleNavigate('/my-books')}>
        <ListItemIcon>
          <LibraryBooks fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="My Books" />
      </MenuItem>
      <MenuItem onClick={() => handleNavigate('/favorites')}>
        <ListItemIcon>
          <Bookmark fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Favorites" />
      </MenuItem>
      <MenuItem onClick={() => handleNavigate('/my-exchanges')}>
        <ListItemIcon>
          <SwapHoriz fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="My Exchanges" />
      </MenuItem>
      <MenuItem onClick={() => handleNavigate('/exchange-history')}>
        <ListItemIcon>
          <History fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Exchange History" />
      </MenuItem>
      <MenuItem onClick={() => handleNavigate('/my-chats')}>
        <ListItemIcon>
          <MessageNotificationBell smallIcon />
        </ListItemIcon>
        <ListItemText primary="Messages" />
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <ExitToApp fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </MenuItem>
    </Menu>
  );

  const drawer = (
    <div className={classes.drawer}>
      <div className={classes.toolbar}>
        <Typography variant="h6" className={classes.title}>
          📚 BookSwap
        </Typography>
      </div>
      <Divider />
      <List>
        <ListItem button onClick={() => handleNavigate('/')}>
          <ListItemIcon><Home /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button onClick={() => handleNavigate('/fiction')}>
          <ListItemIcon><MenuBook /></ListItemIcon>
          <ListItemText primary="Fiction" />
        </ListItem>
        <ListItem button onClick={() => handleNavigate('/manga')}>
          <ListItemIcon><MenuBook /></ListItemIcon>
          <ListItemText primary="Manga" />
        </ListItem>
        <ListItem button onClick={() => handleNavigate('/biography')}>
          <ListItemIcon><MenuBook /></ListItemIcon>
          <ListItemText primary="Biography" />
        </ListItem>
      </List>
      <Divider />
      {currentUser && (
        <List>
          <ListItem button onClick={() => handleNavigate('/add-book')}>
            <ListItemIcon><Add /></ListItemIcon>
            <ListItemText primary="Add Book" />
          </ListItem>
          <ListItem button onClick={() => handleNavigate('/my-books')}>
            <ListItemIcon><LibraryBooks /></ListItemIcon>
            <ListItemText primary="My Books" />
          </ListItem>
          <ListItem button onClick={() => handleNavigate('/favorites')}>
            <ListItemIcon><Bookmark /></ListItemIcon>
            <ListItemText primary="Favorites" />
          </ListItem>
          <ListItem button onClick={() => handleNavigate('/my-exchanges')}>
            <ListItemIcon><SwapHoriz /></ListItemIcon>
            <ListItemText primary="My Exchanges" />
          </ListItem>
          <ListItem button onClick={() => handleNavigate('/my-chats')}>
            <ListItemIcon><MessageNotificationBell smallIcon /></ListItemIcon>
            <ListItemText primary="Messages" />
          </ListItem>
        </List>
      )}
    </div>
  );

  return (
    <>
      <AppBar position="fixed" className={classes.appBar} color="inherit">
        <Container maxWidth="lg">
          <Toolbar className={classes.toolbar}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleToggleDrawer}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            
            <div className={classes.brandContainer}>
              <Typography component={Link} to="/" variant="h6" className={classes.title} color="inherit">
                📚 BookSwap
              </Typography>
            </div>
            
            <div className={classes.navLinks}>
              <Button component={Link} to="/" color="inherit" className={classes.navLink}>Home</Button>
              <Button component={Link} to="/fiction" color="inherit" className={classes.navLink}>Fiction</Button>
              <Button component={Link} to="/manga" color="inherit" className={classes.navLink}>Manga</Button>
              <Button component={Link} to="/biography" color="inherit" className={classes.navLink}>Biography</Button>
              {currentUser && (
                <Button component={Link} to="/add-book" color="inherit" className={classes.navLink}>
                  Add Book
                </Button>
              )}
            </div>
            
            <div className={classes.grow} />
            
            <div className={classes.button}>
              <IconButton 
                component={Link} 
                to="/cart" 
                aria-label="Show cart items" 
                color="inherit"
              >
                <Badge badgeContent={totalItems} color="secondary">
                  <ShoppingCart />
                </Badge>
              </IconButton>
              
              {currentUser ? (
                <div className={classes.userSection}>
                  <NotificationBell />
                  
                  <Tooltip title="Messages">
                    <IconButton component={Link} to="/my-chats" color="inherit">
                      <MessageNotificationBell />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={currentUser.username || 'Profile'}>
                    <IconButton 
                      edge="end" 
                      aria-label="account" 
                      aria-haspopup="true"
                      onClick={handleUserMenuOpen} 
                      color="inherit"
                    >
                      <Avatar className={classes.avatar}>
                        {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  {renderUserMenu}
                </div>
              ) : (
                <div className={classes.authButtons}>
                  <Button component={Link} to="/login" color="primary" variant="outlined">Login</Button>
                  <Button component={Link} to="/register" color="primary" variant="contained" className={classes.registerButton}>Register</Button>
                </div>
              )}
            </div>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleToggleDrawer}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
