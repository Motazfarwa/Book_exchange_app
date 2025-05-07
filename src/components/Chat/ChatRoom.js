import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Divider, 
  CircularProgress,
  Avatar,
  Box
} from '@material-ui/core';
import { useParams, useHistory } from 'react-router-dom';
import { chatService, notificationService } from '../../services/api';
import { getSocket } from '../../services/socket';
import useStyles from './styles';

const ChatRoom = () => {
  const { exchangeId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [exchange, setExchange] = useState(null);
  const [error, setError] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const messagesEndRef = useRef(null);
  const socket = getSocket();
  const classes = useStyles();
  const history = useHistory();
  const isMounted = useRef(true);

  // Set up isMounted ref for cleanup
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch chat messages and determine chat partner
  useEffect(() => {
    let chatSubscription = null;
    
    const fetchData = async () => {
      try {
        if (!exchangeId) {
          setError('No exchange ID provided');
          if (isMounted.current) setLoading(false);
          return;
        }

        console.log(`Fetching data for exchange ID: ${exchangeId}`);
        
        // First get the partner information from message notifications
        try {
          const notifications = await notificationService.getNotifications('message');
          console.log('Fetched notifications:', notifications);
          
          const currentExchangeNotifications = notifications.filter(notification => {
            try {
              const data = typeof notification.data === 'string' 
                ? JSON.parse(notification.data) 
                : notification.data;
              return data && data.exchange_id && data.exchange_id.toString() === exchangeId.toString();
            } catch (e) {
              return false;
            }
          });
          
          if (currentExchangeNotifications.length > 0) {
            const latestNotification = currentExchangeNotifications[0];
            
            // Determine if the notification sender is the chat partner
            const currentUserId = JSON.parse(localStorage.getItem('user')).id;
            const isPartner = latestNotification.sender_id !== currentUserId;
            
            if (isPartner) {
              setChatPartner({
                id: latestNotification.sender_id,
                name: latestNotification.sender_name || 'User'
              });
            } else {
              // Get the recipient ID and name from the notification data
              try {
                const messageData = await chatService.getChatMessages(exchangeId);
                if (messageData && messageData.length > 0) {
                  const firstMessage = messageData.find(msg => msg.sender_id !== currentUserId) || messageData[0];
                  const partnerId = firstMessage.sender_id === currentUserId 
                    ? firstMessage.recipient_id 
                    : firstMessage.sender_id;
                  const partnerName = firstMessage.sender_id === currentUserId 
                    ? firstMessage.recipient_name 
                    : firstMessage.sender_name;
                  
                  setChatPartner({
                    id: partnerId,
                    name: partnerName || 'User'
                  });
                }
              } catch (error) {
                console.error('Error getting partner from message data:', error);
              }
            }
          }
        } catch (notifError) {
          console.error('Error fetching notifications:', notifError);
        }
        
        // Now try to get chat messages
        try {
          const messagesData = await chatService.getChatMessages(exchangeId);
          if (!isMounted.current) return;
          
          if (messagesData && messagesData.length > 0) {
            console.log('Messages data:', messagesData);
            setMessages(messagesData);
            
            // If we still don't have a chat partner, get it from messages
            if (!chatPartner) {
              const currentUserId = JSON.parse(localStorage.getItem('user')).id;
              const firstMessage = messagesData.find(msg => msg.sender_id !== currentUserId) || messagesData[0];
              
              const partnerId = firstMessage.sender_id === currentUserId 
                ? firstMessage.recipient_id 
                : firstMessage.sender_id;
              
              const partnerName = firstMessage.sender_id === currentUserId 
                ? firstMessage.recipient_name 
                : firstMessage.sender_name;
              
              setChatPartner({
                id: partnerId,
                name: partnerName || 'User'
              });
            }
          }
        } catch (chatError) {
          console.error('Error fetching chat messages:', chatError);
          
          // If we couldn't get messages but have a chat partner, we can still show an empty chat
          if (!chatPartner) {
            setError('Could not load the conversation. It may no longer exist.');
            if (isMounted.current) setLoading(false);
            return;
          }
        }
        
        // Subscribe to real-time messages
        if (socket) {
          console.log('Setting up message listener for exchange:', exchangeId);
          
          // Function to handle new messages
          const handleNewMessage = (newMsg) => {
            console.log('Received new message:', newMsg);
            // Convert to number for comparison since params might be strings
            if (newMsg.exchange_id.toString() === exchangeId.toString()) {
              if (isMounted.current) {
                setMessages((prevMessages) => [...prevMessages, newMsg]);
                scrollToBottom();
              }
            }
          };
          
          // Register event listener
          socket.on('new_message', handleNewMessage);
          
          // Store cleanup function
          chatSubscription = () => {
            socket.off('new_message', handleNewMessage);
          };
        }
        
        if (isMounted.current) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching chat data:', err);
        if (isMounted.current) {
          setError('Failed to load chat data. Please try again.');
          setLoading(false);
        }
      }
    };

    fetchData();
    
    // Clean up subscriptions
    return () => {
      if (chatSubscription) {
        chatSubscription();
      }
      isMounted.current = false;
    };
  }, [exchangeId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatPartner) return;

    try {
      const messageData = {
        recipientId: chatPartner.id,
        content: newMessage,
        exchangeId: exchangeId
      };
      
      console.log('Sending message:', messageData);
      
      if (socket) {
        // Emit message via socket
        socket.emit('send_message', messageData);
        
        // Optimistically add message to UI
        const optimisticMessage = {
          id: `temp-${Date.now()}`,
          content: newMessage,
          sender_id: JSON.parse(localStorage.getItem('user')).id,
          recipient_id: chatPartner.id,
          exchange_id: exchangeId,
          created_at: new Date().toISOString(),
          is_read: false,
          temp: true // Mark as temporary until confirmed
        };
        
        if (isMounted.current) {
          setMessages(prev => [...prev, optimisticMessage]);
          setNewMessage('');
        }
      } else {
        // Fallback to REST API if socket not available
        const message = await chatService.sendMessage(messageData);
        
        if (isMounted.current) {
          setMessages(prev => [...prev, message]);
          setNewMessage('');
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
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
            onClick={() => history.push('/my-chats')}
            className={classes.backButton}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!chatPartner) {
    return (
      <Container>
        <Paper className={classes.errorPaper}>
          <Typography variant="h6" color="error">
            Could not determine chat partner. Please try again.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => history.push('/my-chats')}
            className={classes.backButton}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  const currentUserId = JSON.parse(localStorage.getItem('user')).id;

  return (
    <Container className={classes.chatContainer}>
      <Paper className={classes.chatPaper}>
        <Box className={classes.chatHeader}>
          <Typography variant="h6">
            {chatPartner?.name || 'User'} 
            {exchange?.book_title && ` - Book: ${exchange.book_title}`}
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            size="small"
            onClick={() => history.push('/my-chats')}
          >
            Back to Chats
          </Button>
        </Box>
        
        <Divider />
        
        <Box className={classes.messagesContainer}>
          {messages.length === 0 ? (
            <Typography className={classes.noMessages}>
              No messages yet. Start the conversation!
            </Typography>
          ) : (
            messages.map((msg) => (
              <Box
                key={msg.id}
                className={`${classes.messageBox} ${
                  msg.sender_id === currentUserId ? classes.sentMessage : classes.receivedMessage
                }`}
              >
                <Box className={classes.messageContent}>
                  <Typography variant="body1">{msg.content}</Typography>
                  <Typography variant="caption" className={classes.timestamp}>
                    {new Date(msg.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        <Divider />
        
        <form onSubmit={handleSendMessage} className={classes.messageForm}>
          <TextField
            className={classes.messageInput}
            variant="outlined"
            placeholder="Type your message here..."
            value={newMessage}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            InputProps={{ 
              className: classes.inputRoot
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!newMessage.trim()}
            className={classes.sendButton}
          >
            Send
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ChatRoom;
