import { makeStyles } from '@material-ui/core/styles';

export default makeStyles((theme) => ({
  chatContainer: {
    marginTop: theme.spacing(10),
    marginBottom: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 180px)',
  },
  chatPaper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: 0,
    overflow: 'hidden',
  },
  chatHeader: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
  },
  messagesContainer: {
    padding: theme.spacing(2),
    flexGrow: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  messageBox: {
    margin: theme.spacing(0.5, 0),
    maxWidth: '70%',
    borderRadius: 16,
    padding: theme.spacing(1, 2),
    wordBreak: 'break-word',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.palette.grey[300],
    borderBottomLeftRadius: 4,
  },
  messageContent: {
    position: 'relative',
  },
  timestamp: {
    display: 'block',
    fontSize: '0.7rem',
    marginTop: theme.spacing(0.5),
    opacity: 0.8,
    textAlign: 'right',
  },
  messageForm: {
    display: 'flex',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
  messageInput: {
    marginRight: theme.spacing(1),
    marginTop: 0,
    marginBottom: 0,
  },
  inputRoot: {
    padding: '10px 14px',
  },
  sendButton: {
    height: 56,
    marginTop: 0,
    marginBottom: 0,
  },
  noMessages: {
    textAlign: 'center',
    margin: 'auto',
    color: theme.palette.text.secondary,
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 180px)',
  },
  errorPaper: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  backButton: {
    marginTop: theme.spacing(2),
  },
  chatListContainer: {
    marginTop: theme.spacing(10),
    marginBottom: theme.spacing(4),
  },
  chatListPaper: {
    padding: 0,
    minHeight: 400,
  },
  chatListHeader: {
    padding: theme.spacing(2),
    fontWeight: 500,
  },
  chatListItem: {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
  chatPreview: {
    display: 'flex',
    flexDirection: 'column',
  },
  lastMessage: {
    color: theme.palette.text.secondary,
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  messageTime: {
    color: theme.palette.text.hint,
    fontSize: '0.7rem',
  },
  unreadBadge: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
  emptyChats: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    height: 300,
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));
