import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Snackbar,
  CircularProgress,
  Divider
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Person as PersonIcon } from '@material-ui/icons';
import { authService } from '../../services/api';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(10),
    marginBottom: theme.spacing(8),
  },
  paper: {
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 10,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: '#001524',
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    backgroundColor: '#001524',
    color: 'white',
    padding: theme.spacing(1.5),
    '&:hover': {
      backgroundColor: '#2a344a',
    },
  },
  title: {
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 600,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    color: '#001524',
  },
  subtitle: {
    color: '#555',
    marginBottom: theme.spacing(3),
  },
  divider: {
    margin: theme.spacing(3, 0),
    width: '100%',
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  profileInfo: {
    marginBottom: theme.spacing(3),
  },
  infoLabel: {
    fontWeight: 500,
    color: '#555',
  },
  infoValue: {
    marginTop: theme.spacing(0.5),
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
}));

const Profile = ({ onProfileUpdate }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(authService.getCurrentUser() || {});
  const [formData, setFormData] = useState({
    username: userData.username || '',
    email: userData.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Refresh user data if needed
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUserData(currentUser);
      setFormData(prevState => ({
        ...prevState,
        username: currentUser.username || '',
        email: currentUser.email || '',
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmitBasicInfo = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Only update basic info (username and email)
      const updatedData = {
        username: formData.username,
        email: formData.email
      };

      const result = await authService.updateProfile(updatedData);
      
      setUserData(result);
      if (onProfileUpdate) {
        onProfileUpdate(result);
      }
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match',
        severity: 'error'
      });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: 'New password must be at least 6 characters',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);

    try {
      const passwordData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      };

      await authService.updateProfile({ password: passwordData });
      
      // Clear password fields after successful update
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSnackbar({
        open: true,
        message: 'Password updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to update password',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container component="main" maxWidth="md" className={classes.container}>
      <Paper className={classes.paper}>
        <Avatar className={classes.avatar}>
          <PersonIcon fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h4" className={classes.title}>
          My Profile
        </Typography>
        <Typography variant="body1" className={classes.subtitle}>
          View and update your profile information
        </Typography>

        {/* Basic Profile Information */}
        <Grid container spacing={2} className={classes.profileInfo}>
          <Grid item xs={12} sm={6}>
            <Typography className={classes.infoLabel}>Username</Typography>
            <Typography variant="h6" className={classes.infoValue}>
              {userData.username}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography className={classes.infoLabel}>Email</Typography>
            <Typography variant="h6" className={classes.infoValue}>
              {userData.email}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography className={classes.infoLabel}>Account Type</Typography>
            <Typography variant="h6" className={classes.infoValue}>
              {userData.role || 'User'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography className={classes.infoLabel}>Member Since</Typography>
            <Typography variant="h6" className={classes.infoValue}>
              {userData.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>
        </Grid>

        <Divider className={classes.divider} />

        {/* Edit Profile Form */}
        <Typography variant="h5" className={classes.sectionTitle}>
          Edit Profile
        </Typography>
        <form className={classes.form} onSubmit={handleSubmitBasicInfo}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                className={classes.textField}
                variant="outlined"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                className={classes.textField}
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            className={classes.submit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Profile'}
          </Button>
        </form>

        <Divider className={classes.divider} />

        {/* Change Password Form */}
        <Typography variant="h5" className={classes.sectionTitle}>
          Change Password
        </Typography>
        <form className={classes.form} onSubmit={handleChangePassword}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                className={classes.textField}
                variant="outlined"
                required
                fullWidth
                name="currentPassword"
                label="Current Password"
                type="password"
                id="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                className={classes.textField}
                variant="outlined"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                id="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                className={classes.textField}
                variant="outlined"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            className={classes.submit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </form>
      </Paper>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
