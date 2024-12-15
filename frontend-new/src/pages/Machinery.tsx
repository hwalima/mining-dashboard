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
  Chip
} from '@mui/material'
import { dashboardService } from '../services/api'

export default function Machinery() {
  const [machinery, setMachinery] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMachinery = async () => {
      try {
        const response = await dashboardService.getMachinery()
        setMachinery(response)
        setLoading(false)
      } catch (err) {
        setError('Failed to load machinery')
        setLoading(false)
      }
    }

    fetchMachinery()
  }, [])

  const getStatusColor = (status: string): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case 'operational': return 'success'
      case 'maintenance': return 'warning'
      case 'broken': return 'error'
      default: return 'default'
    }
  }

  if (loading) return <Typography>Loading...</Typography>
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ my: 4 }}>
        Machinery Management
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Machine ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Maintenance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {machinery.map((machine: any) => (
              <TableRow key={machine.id}>
                <TableCell>{machine.id}</TableCell>
                <TableCell>{machine.name}</TableCell>
                <TableCell>{machine.type}</TableCell>
                <TableCell>
                  <Chip 
                    label={machine.status} 
                    color={getStatusColor(machine.status)}
                    size="small" 
                  />
                </TableCell>
                <TableCell>{machine.lastMaintenance}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}
