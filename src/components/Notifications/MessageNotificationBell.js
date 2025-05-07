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
  Slide,
  Avatar,
  ListItemAvatar,
  Chip
} from '@material-ui/core';
import { Email } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { notificationService } from '../../services/api';
import { getSocket, onNewMessageNotification } from '../../services/socket';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
  notificationsBadge: {
    right: 3,
    top: 10,
    backgroundColor: theme.palette.info.main,
  },
  notificationsList: {
    width: 320,
    maxHeight: 400,
    overflow: 'auto',
  },
  notificationItem: {
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: (props) => props.isRead ? 'transparent' : '#e3f2fd',
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
      boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.7)'
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(33, 150, 243, 0)'
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)'
    }
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: theme.palette.primary.main,
    fontSize: '1rem',
  },
  messageCount: {
    marginLeft: theme.spacing(1),
    height: 20,
    minWidth: 20,
    padding: '0 6px',
  },
  userInitials: {
    fontSize: '0.875rem',
  }
}));

const MessageNotificationBell = ({ smallIcon }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [newNotification, setNewNotification] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const classes = useStyles();
  const history = useHistory();
  const socket = getSocket();
  const notificationsInitialized = useRef(false);

  // Group notifications by sender and exchange
  const groupedNotifications = notifications.reduce((acc, notification) => {
    // Parse the notification data
    let notifData = {};
    if (notification.data) {
      try {
        notifData = typeof notification.data === 'string' 
          ? JSON.parse(notification.data) 
          : notification.data;
      } catch (err) {
        console.error('Error parsing notification data:', err);
      }
    }
    
    const exchangeId = notifData.exchange_id;
    const senderId = notification.sender_id;
    
    // Create a unique key for each sender-exchange combination
    const groupKey = `${senderId}-${exchangeId}`;
    
    if (!acc[groupKey]) {
      acc[groupKey] = {
        exchangeId,
        senderId,
        senderName: notification.sender_name,
        messages: [],
        latestTimestamp: notification.created_at,
        isRead: true
      };
    }
    
    // Add message to group
    acc[groupKey].messages.push(notification);
    
    // Update latest timestamp if newer
    if (new Date(notification.created_at) > new Date(acc[groupKey].latestTimestamp)) {
      acc[groupKey].latestTimestamp = notification.created_at;
    }
    
    // Mark group as unread if any message is unread
    if (!notification.is_read) {
      acc[groupKey].isRead = false;
    }
    
    return acc;
  }, {});

  const fetchNotifications = async () => {
    try {
      console.log('Fetching message notifications');
      const data = await notificationService.getNotifications('message');
      console.log('Received message notifications:', data);
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
      console.error('Error fetching message notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Handle new real-time message notification
  const handleNewNotification = useCallback((notification) => {
    console.log('Received real-time message notification:', notification);
    
    if (notificationsInitialized.current) {
      // Check if there's a notification from the same sender for the same exchange recently
      const isSameConversation = notifications.some(n => {
        // Check if we have a sender_id match
        if (n.sender_id !== notification.sender_id) return false;
        
        // Parse data from both notifications
        let existingData = {};
        let newData = {};
        
        try {
          existingData = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
          newData = typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data;
        } catch (err) {
          return false;
        }
        
        // Check if both refer to the same exchange
        return existingData.exchange_id === newData.exchange_id;
      });
      
      // Add to notifications list at the beginning (newest first)
      setNotifications(prev => [notification, ...prev]);
      
      // Increment unread count
      setUnreadCount(count => count + 1);
      
      // If this is not a duplicate conversation, show snackbar
      if (!isSameConversation) {
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
    const unsubscribe = onNewMessageNotification(handleNewNotification);
    
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

  const handleNotificationClick = async (groupKey) => {
    const group = groupedNotifications[groupKey];
    
    if (!group.isRead) {
      try {
        // Mark all notifications in this group as read
        const promises = group.messages
          .filter(n => !n.is_read)
          .map(n => notificationService.markAsRead(n.id));
        
        await Promise.all(promises);
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => {
            // If this notification belongs to the group being marked as read
            if (n.sender_id === group.senderId && 
                group.messages.some(m => m.id === n.id) && 
                !n.is_read) {
              return { ...n, is_read: true };
            }
            return n;
          })
        );
        
        // Recalculate unread count
        setUnreadCount(prev => Math.max(0, prev - group.messages.filter(m => !m.is_read).length));
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    }
    
    // First close the popover to prevent state updates after unmount
    handleClose();
    
    // Extract exchange ID from the notification data
    let exchangeId = null;
    try {
      // Find the newest message in the group
      const newestMessage = group.messages[0];
      
      if (newestMessage && newestMessage.data) {
        const notifData = typeof newestMessage.data === 'string' 
          ? JSON.parse(newestMessage.data) 
          : newestMessage.data;
        
        exchangeId = notifData.exchange_id;
        console.log('Extracted exchange ID from notification:', exchangeId);
      }
    } catch (error) {
      console.error('Error extracting exchange ID from notification:', error);
    }
    
    // Navigate to the chat with a small delay to ensure cleanup
    setTimeout(() => {
      if (exchangeId) {
        console.log(`Navigating to chat with exchange ID: ${exchangeId}`);
        history.push(`/chat/${exchangeId}`);
      } else {
        console.warn('No exchange ID found, navigating to chats list');
        history.push('/my-chats');
      }
    }, 10);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead('message');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all message notifications as read:', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSnackbarClick = () => {
    if (newNotification) {
      // Close snackbar first
      setSnackbarOpen(false);
      
      // Extract exchange ID from notification data
      let exchangeId = null;
      try {
        if (newNotification.data) {
          const notifData = typeof newNotification.data === 'string' 
            ? JSON.parse(newNotification.data) 
            : newNotification.data;
          
          exchangeId = notifData.exchange_id;
        }
      } catch (error) {
        console.error('Error extracting exchange ID from notification:', error);
      }
      
      // Navigate with a small delay to ensure cleanup
      setTimeout(() => {
        if (exchangeId) {
          console.log(`Navigating to chat with exchange ID: ${exchangeId}`);
          history.push(`/chat/${exchangeId}`);
        } else {
          history.push('/my-chats');
        }
      }, 10);
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return 'Unknown time';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'message-notifications-popover' : undefined;

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleClick} 
        aria-label="message-notifications"
        aria-describedby={id}
        className={unreadCount > 0 ? classes.newNotification : ''}
        style={smallIcon ? { padding: 0, margin: 0 } : {}}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="primary" 
          classes={{ badge: classes.notificationsBadge }}
          invisible={unreadCount === 0}
        >
          <Email fontSize={smallIcon ? "small" : "default"} />
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
          <Typography variant="subtitle1"><strong>Messages</strong></Typography>
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
          {Object.keys(groupedNotifications).length === 0 ? (
            <Box className={classes.emptyNotifications}>
              <Typography variant="body2">No message notifications</Typography>
            </Box>
          ) : (
            Object.entries(groupedNotifications)
              .sort(([_, a], [__, b]) => new Date(b.latestTimestamp) - new Date(a.latestTimestamp)) // Sort by latest timestamp
              .map(([groupKey, group]) => (
                <ListItem 
                  key={groupKey} 
                  button 
                  className={classes.notificationItem}
                  onClick={() => handleNotificationClick(groupKey)}
                  style={{
                    backgroundColor: group.isRead ? 'transparent' : '#e3f2fd'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar className={classes.avatar}>
                      <span className={classes.userInitials}>{getInitials(group.senderName)}</span>
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography 
                          component="span" 
                          variant="body2" 
                          style={{ fontWeight: group.isRead ? 'normal' : 'bold' }}
                        >
                          {group.senderName}
                        </Typography>
                        {group.messages.length > 1 && (
                          <Chip 
                            label={group.messages.length} 
                            size="small" 
                            color="primary" 
                            className={classes.messageCount}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span" noWrap style={{display: 'block', maxWidth: '200px'}}>
                          {group.messages[0].message.replace(/^[^:]+: /, '')}
                        </Typography>
                        <Typography variant="caption" className={classes.notificationTime}>
                          {formatTimestamp(group.latestTimestamp)}
                        </Typography>
                      </>
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
          {newNotification?.message || 'New message received'}
        </Alert>
      </Snackbar>
    </>
  );
};

// Default props
MessageNotificationBell.defaultProps = {
  smallIcon: false
};

export default MessageNotificationBell;
