import { useState } from 'react'
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  TextField, 
  Button,
  Avatar,
  Grid,
  Snackbar,
  Alert
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState({ type: 'success', text: '' })
  const [openSnackbar, setOpenSnackbar] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Implement profile update logic
      setMessage({ type: 'success', text: 'Profile updated successfully' })
      setOpenSnackbar(true)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' })
      setOpenSnackbar(true)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      setOpenSnackbar(true)
      return
    }
    try {
      // TODO: Implement password update logic
      setMessage({ type: 'success', text: 'Password updated successfully' })
      setOpenSnackbar(true)
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update password' })
      setOpenSnackbar(true)
    }
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ my: 4 }}>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{ 
                width: 100, 
                height: 100, 
                margin: '0 auto',
                bgcolor: 'primary.main'
              }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
            <Typography variant="h6" sx={{ mt: 2 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography color="textSecondary">
              {user?.role || 'User'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleUpdateProfile}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary">
                    Update Profile
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Box component="form" onSubmit={handleUpdatePassword} sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary">
                    Update Password
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={message.type as 'success' | 'error'} 
          sx={{ width: '100%' }}
        >
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  )
}
