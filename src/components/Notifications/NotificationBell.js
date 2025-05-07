import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Badge, 
  IconButton, 
  Popover, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Box, 
  Button,
  Divider,
  Snackbar,
  Slide
} from '@material-ui/core';
import { Notifications } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { notificationService } from '../../services/api';
import { getSocket, onNewNotification } from '../../services/socket';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
  notificationsBadge: {
    right: 3,
    top: 10,
    backgroundColor: theme.palette.error.main,
  },
  notificationsList: {
    width: 320,
    maxHeight: 400,
    overflow: 'auto',
  },
  notificationItem: {
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: (props) => props.isRead ? 'transparent' : '#f0f7ff',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  notificationTime: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
  },
  emptyNotifications: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  popoverHeader: {
    padding: theme.spacing(1, 2),
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newNotification: {
    animation: '$pulse 2s infinite'
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.7)'
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(255, 0, 0, 0)'
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(255, 0, 0, 0)'
    }
  }
}));

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [newNotification, setNewNotification] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const classes = useStyles();
  const history = useHistory();
  const socket = getSocket();
  const notificationsInitialized = useRef(false);

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications');
      const data = await notificationService.getNotifications();
      console.log('Received notifications:', data);
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(notification => !notification.is_read).length);
        notificationsInitialized.current = true;
      } else {
        console.error('Unexpected notification data format:', data);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Handle new real-time notification
  const handleNewNotification = useCallback((notification) => {
    console.log('Received real-time notification in handler:', notification);
    
    // Only process if notifications have been initialized
    if (notificationsInitialized.current) {
      // Check if notification already exists to avoid duplicates
      const exists = notifications.some(n => n.id === notification.id);
      
      if (!exists) {
        // Add to notifications list at the beginning (newest first)
        setNotifications(prev => [notification, ...prev]);
        
        // Increment unread count
        setUnreadCount(count => count + 1);
        
        // Show snackbar for new notification
        setNewNotification(notification);
        setSnackbarOpen(true);
      }
    }
  }, [notifications]);

  // Initial fetch of notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Setup real-time notification listener
  useEffect(() => {
    // Register handler for real-time notifications
    const unsubscribe = onNewNotification(handleNewNotification);
    
    // Cleanup
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [handleNewNotification]);

  // Handle menu events
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id);
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Parse the notification data if it's a string
    let notifData = {};
    if (notification.data) {
      try {
        notifData = typeof notification.data === 'string' 
          ? JSON.parse(notification.data) 
          : notification.data;
        console.log('Parsed notification data:', notifData);
      } catch (err) {
        console.error('Error parsing notification data:', err);
      }
    }
    
    // Navigate based on notification type and data
    if (notification.type === 'exchange_request') {
      const exchangeId = notifData.exchange_id;
      if (exchangeId) {
        console.log(`Navigating to exchange with ID: ${exchangeId}`);
        // Use this URL format to match with the route in App.js
        history.push(`/exchange/${exchangeId}`);
      } else {
        history.push('/my-exchanges');
      }
    } else if (notification.type === 'message') {
      const exchangeId = notifData.exchange_id;
      if (exchangeId) {
        console.log(`Navigating to chat with ID: ${exchangeId}`);
        history.push(`/chat/${exchangeId}`);
      } else {
        history.push('/my-chats');
      }
    } else {
      // Default to my-exchanges for other notification types
      history.push('/my-exchanges');
    }
    
    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSnackbarClick = () => {
    if (newNotification) {
      handleNotificationClick(newNotification);
      setSnackbarOpen(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleClick} 
        aria-label="notifications"
        aria-describedby={id}
        className={unreadCount > 0 ? classes.newNotification : ''}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error" 
          classes={{ badge: classes.notificationsBadge }}
          invisible={unreadCount === 0}
        >
          <Notifications />
        </Badge>
      </IconButton>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box className={classes.popoverHeader}>
          <Typography variant="subtitle1"><strong>Notifications</strong></Typography>
          {unreadCount > 0 && (
            <Button 
              color="primary" 
              size="small" 
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        <List className={classes.notificationsList}>
          {notifications.length === 0 ? (
            <Box className={classes.emptyNotifications}>
              <Typography variant="body2">No notifications</Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <ListItem 
                key={notification.id} 
                button 
                className={classes.notificationItem}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  backgroundColor: notification.is_read ? 'transparent' : '#f0f7ff'
                }}
              >
                <ListItemText
                  primary={
                    <Typography 
                      component="div" 
                      variant="body2" 
                      style={{ fontWeight: notification.is_read ? 'normal' : 'bold' }}
                    >
                      {notification.message}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" className={classes.notificationTime}>
                      {formatTime(notification.created_at)}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Popover>
      
      {/* Snackbar for new notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="info"
          variant="filled"
          action={
            <Button color="inherit" size="small" onClick={handleSnackbarClick}>
              VIEW
            </Button>
          }
        >
          {newNotification?.message || 'New notification received'}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationBell;
