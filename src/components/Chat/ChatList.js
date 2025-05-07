import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Box,
  CircularProgress,
  Button
} from '@material-ui/core';
import { Chat as ChatIcon, ArrowBack } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import { notificationService } from '../../services/api';
import useStyles from './styles';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const classes = useStyles();
  const history = useHistory();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        // Use the same endpoint as the navbar (message notifications)
        const notifications = await notificationService.getNotifications('message');
        console.log('Fetched message notifications:', notifications);
        
        // Group notifications by exchange ID to create chat conversations
        const groupedChats = {};
        
        notifications.forEach(notification => {
          // Extract data from notification
          const notifData = typeof notification.data === 'string' 
            ? JSON.parse(notification.data) 
            : notification.data;
            
          const exchangeId = notifData?.exchange_id;
          
          if (exchangeId) {
            // Initialize this exchange group if it doesn't exist
            if (!groupedChats[exchangeId]) {
              groupedChats[exchangeId] = {
                exchange_id: exchangeId,
                partner_name: notification.sender_name || 'Unknown User',
                partner_id: notification.sender_id,
                messages: [],
                last_message: null,
                unread_count: 0
              };
            }
            
            // Add this notification to the exchange's messages
            groupedChats[exchangeId].messages.push(notification);
            
            // Track unread messages
            if (!notification.is_read) {
              groupedChats[exchangeId].unread_count += 1;
            }
          }
        });
        
        // Find the latest message for each exchange
        Object.values(groupedChats).forEach(chat => {
          if (chat.messages.length > 0) {
            // Sort messages by date (newest first)
            const sortedMessages = [...chat.messages].sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
            
            // Set the last message
            chat.last_message = {
              content: sortedMessages[0].message,
              created_at: sortedMessages[0].created_at
            };
          }
        });
        
        // Convert to array and sort by latest message
        const chatList = Object.values(groupedChats).sort((a, b) => {
          const dateA = a.last_message ? new Date(a.last_message.created_at) : new Date(0);
          const dateB = b.last_message ? new Date(b.last_message.created_at) : new Date(0);
          return dateB - dateA;
        });
        
        setChats(chatList);
        setError(null);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Failed to load conversations. Please try again later.');
        setChats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleChatClick = (exchangeId) => {
    if (exchangeId) {
      history.push(`/chat/${exchangeId}`);
    }
  };

  // Create a safe avatar display component
  const SafeAvatar = ({ userName }) => {
    const getInitials = (name) => {
      if (!name) return '?';
      
      try {
        return name.split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);
      } catch (error) {
        console.error('Error getting initials:', error);
        return '?';
      }
    };
    
    const initials = userName ? getInitials(userName) : '?';
    
    return (
      <Avatar className={classes.avatar}>
        {initials}
      </Avatar>
    );
  };

  if (loading) {
    return (
      <Container className={classes.loaderContainer}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Paper className={classes.errorPaper}>
          <Typography variant="h6" color="error">{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => history.push('/')}
            startIcon={<ArrowBack />}
            className={classes.backButton}
          >
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container className={classes.chatListContainer}>
      <Paper className={classes.chatListPaper}>
        <Typography variant="h5" className={classes.chatListHeader}>
          Your Conversations
        </Typography>
        
        <Divider />
        
        {chats.length === 0 ? (
          <Box className={classes.emptyChats}>
            <ChatIcon fontSize="large" color="disabled" />
            <Typography variant="body1" color="textSecondary">
              You don't have any conversations yet
            </Typography>
          </Box>
        ) : (
          <List>
            {chats.map((chat) => (
              <React.Fragment key={chat.exchange_id}>
                <ListItem 
                  button 
                  onClick={() => handleChatClick(chat.exchange_id)}
                  className={classes.chatListItem}
                >
                  <ListItemAvatar>
                    <SafeAvatar userName={chat.partner_name} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        {chat.partner_name || 'Unknown User'}
                      </Typography>
                    }
                    secondary={
                      <Box component="span" className={classes.chatPreview}>
                        <Typography 
                          component="span" 
                          variant="body2" 
                          noWrap 
                          className={classes.lastMessage}
                        >
                          {chat.last_message ? chat.last_message.content : 'No messages yet'}
                        </Typography>
                        {chat.last_message && (
                          <Typography 
                            component="span" 
                            variant="caption" 
                            className={classes.messageTime}
                          >
                            {new Date(chat.last_message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  {chat.unread_count > 0 && (
                    <Box className={classes.unreadBadge}>
                      {chat.unread_count}
                    </Box>
                  )}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default ChatList;
