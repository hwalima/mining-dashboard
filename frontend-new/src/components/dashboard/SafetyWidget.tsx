import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as SafeIcon,
  Warning as WarningIcon,
  Error as DangerIcon,
} from '@mui/icons-material';

interface SafetyIncident {
  id: number;
  date: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High';
  description: string;
}

interface SafetyWidgetProps {
  incidents: SafetyIncident[];
  daysWithoutIncident: number;
}

const SafetyWidget: React.FC<SafetyWidgetProps> = ({
  incidents,
  daysWithoutIncident,
}) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Low':
        return <SafeIcon color="success" />;
      case 'Medium':
        return <WarningIcon color="warning" />;
      case 'High':
        return <DangerIcon color="error" />;
      default:
        return <SafeIcon />;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Safety Status
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            backgroundColor: 'success.light',
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Typography variant="h4" color="white">
            {daysWithoutIncident}
          </Typography>
          <Typography variant="body2" color="white" sx={{ ml: 1 }}>
            Days Without Incidents
          </Typography>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Recent Incidents
        </Typography>
        
        <List dense>
          {incidents.slice(0, 3).map((incident) => (
            <ListItem key={incident.id}>
              <ListItemIcon>{getSeverityIcon(incident.severity)}</ListItemIcon>
              <ListItemText
                primary={incident.type}
                secondary={`${incident.date} - ${incident.description}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default SafetyWidget;
