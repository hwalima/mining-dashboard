import { useState, useEffect } from 'react'
import { 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import { dashboardService } from '../services/api'

export default function ProductionLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [newLog, setNewLog] = useState({
    date: '',
    goldProduced: '',
    notes: ''
  })

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await dashboardService.getDailyLogs()
        setLogs(response)
        setLoading(false)
      } catch (err) {
        setError('Failed to load production logs')
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const handleAddLog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setNewLog({ date: '', goldProduced: '', notes: '' })
  }

  const handleSaveLog = async () => {
    try {
      // TODO: Implement log saving logic
      handleCloseDialog()
    } catch (err) {
      console.error('Failed to save log', err)
    }
  }

  if (loading) return <Typography>Loading...</Typography>
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ my: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Production Logs
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddLog}
        >
          Add New Log
        </Button>
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Gold Produced (oz)</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log: any) => (
              <TableRow key={log.id}>
                <TableCell>{log.date}</TableCell>
                <TableCell>{log.goldProduced.toFixed(2)}</TableCell>
                <TableCell>{log.notes || 'No additional notes'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Production Log</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            value={newLog.date}
            onChange={(e) => setNewLog({...newLog, date: e.target.value})}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="Gold Produced (oz)"
            type="number"
            fullWidth
            value={newLog.goldProduced}
            onChange={(e) => setNewLog({...newLog, goldProduced: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Notes"
            multiline
            rows={4}
            fullWidth
            value={newLog.notes}
            onChange={(e) => setNewLog({...newLog, notes: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveLog} color="primary">
            Save Log
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
