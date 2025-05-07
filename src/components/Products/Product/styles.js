import { makeStyles } from "@material-ui/core/styles";

export default makeStyles(() => ({
  root: {
    maxWidth: "100%",
    background: "linear-gradient(45deg, #F8F9FA 30%, #FFFFFF 90%)",
    borderRadius: 12,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    }
  },
  media: {
    height: 0,
    paddingTop: "130%",
    backgroundSize: "contain",
    backgroundPosition: "center",
    transition: 'transform 0.3s ease',
    "&:hover": {
      transform: 'scale(1.05)',
    },
  },
  cardActions: {
    display: "flex",
    justifyContent: "center",
    padding: "8px 16px 16px 16px",
  },
  cardContent: {
    display: "flex",
    justifyContent: "center",
    padding: "8px 16px 0 16px",
  },
  cardDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 16px",
  },
  button: {
    background: "#001524",
    color: "white",
    width: "85%",
    height: "40px",
    borderRadius: 20,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    "&:hover": {
      backgroundColor: "#2a344a",
      boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
    },
  },
  buttonsWrapper: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favoriteButton: {
    backgroundColor: '#f8f8f8',
    '&:hover': {
      backgroundColor: '#f1f1f1',
    }
  },
  cardContentName: {
    fontSize: 16,
    textAlign: "center",
    margin: "4px 0",
    fontWeight: 600,
    fontFamily: 'Poppins',
    height: 48,
    overflow: 'hidden',
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
  },
  cardContentAuthor: {
    fontSize: 14,
    color: "#555",
    margin: "0 0 8px 0",
    fontStyle: "italic",
  },
  cardContentPrice: {
    fontSize: 18,
    color: "#F1361D",
    margin: "0 0 8px 0",
  },
  rentPrice: {
    fontSize: '0.8em',
    color: '#555',
    fontStyle: 'italic'
  },
  "@media (max-width: 700px)": {
    cardContentName: {
      fontSize: 14,
      height: 42,
    },
    cardContentAuthor: {
      fontSize: 12,
    },
    cardContentPrice: {
      fontSize: 16,
    },
    button: {
      fontSize: 12,
    },
  },
}));
