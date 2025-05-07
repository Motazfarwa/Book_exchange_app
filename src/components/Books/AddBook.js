import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Snackbar,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import { bookService, authService } from "../../services/api";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(8),
  },
  paper: {
    padding: theme.spacing(4),
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 600,
    marginBottom: theme.spacing(4),
    fontFamily: "Poppins, sans-serif",
    color: "#001524",
  },
  form: {
    width: "100%",
  },
  formControl: {
    width: "100%",
    marginBottom: theme.spacing(3),
  },
  submitButton: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(1.5),
    borderRadius: 30,
    backgroundColor: "#001524",
    color: "white",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: "#2a344a",
    },
  },
  optionsSection: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  optionsTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
}));

const conditions = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "very_good", label: "Very Good" },
  { value: "good", label: "Good" },
  { value: "acceptable", label: "Acceptable" },
];

const AddBook = () => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    isbn: "",
    condition: "good",
    cover_image: "",
    price: "",
    rent_price: "",
    is_rentable: true,
    is_sellable: true,
  });

  // Get current user
  const currentUser = authService.getCurrentUser();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setSnackbar({
        open: true,
        message: "You must be logged in to add a book",
        severity: "error",
      });
      return;
    }
    
    // Validate required fields
    const requiredFields = ["title", "author"];
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      setSnackbar({
        open: true,
        message: `Please fill in all required fields: ${emptyFields.join(", ")}`,
        severity: "error",
      });
      return;
    }
    
    // Validate prices if selling or renting is enabled
    if (formData.is_sellable && (!formData.price || parseFloat(formData.price) <= 0)) {
      setSnackbar({
        open: true,
        message: "Please provide a valid price for selling",
        severity: "error",
      });
      return;
    }
    
    if (formData.is_rentable && (!formData.rent_price || parseFloat(formData.rent_price) <= 0)) {
      setSnackbar({
        open: true,
        message: "Please provide a valid price for renting",
        severity: "error",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Add owner_id to the form data
      const bookData = {
        ...formData,
        owner_id: currentUser.id,
        price: parseFloat(formData.price),
        rent_price: parseFloat(formData.rent_price),
      };
      
      await bookService.createBook(bookData);
      
      setSnackbar({
        open: true,
        message: "Book added successfully!",
        severity: "success",
      });
      
      // Redirect to book list after a short delay
      setTimeout(() => {
        history.push("/my-books");
      }, 1500);
    } catch (error) {
      console.error("Error adding book:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to add book. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" className={classes.container}>
      <Paper className={classes.paper}>
        <Typography className={classes.title} align="center">
          Add a New Book
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                variant="outlined"
                className={classes.formControl}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                variant="outlined"
                className={classes.formControl}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={4}
                className={classes.formControl}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ISBN"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                variant="outlined"
                className={classes.formControl}
                helperText="Optional: Add ISBN for better book identification"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel>Condition</InputLabel>
                <Select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  label="Condition"
                >
                  {conditions.map((condition) => (
                    <MenuItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cover Image URL"
                name="cover_image"
                value={formData.cover_image}
                onChange={handleChange}
                variant="outlined"
                className={classes.formControl}
                helperText="Optional: Add a URL to the book cover image"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Paper className={classes.optionsSection}>
                <Typography className={classes.optionsTitle}>
                  Exchange Options
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.is_sellable}
                          onChange={handleChange}
                          name="is_sellable"
                          color="primary"
                        />
                      }
                      label="Available for Sale"
                    />
                    {formData.is_sellable && (
                      <TextField
                        fullWidth
                        label="Sale Price ($)"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        variant="outlined"
                        required={formData.is_sellable}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.is_rentable}
                          onChange={handleChange}
                          name="is_rentable"
                          color="primary"
                        />
                      }
                      label="Available for Rent"
                    />
                    {formData.is_rentable && (
                      <TextField
                        fullWidth
                        label="Rent Price ($)"
                        name="rent_price"
                        type="number"
                        value={formData.rent_price}
                        onChange={handleChange}
                        variant="outlined"
                        required={formData.is_rentable}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className={classes.submitButton}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Add Book"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddBook;
