import React from 'react';
import { Box, Typography, Link, Grid, useTheme, IconButton, Tooltip } from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
  Language
} from '@mui/icons-material';
import { useCompanySettings } from '../../contexts/CompanySettingsContext';
import { useThemeContext } from '../../contexts/ThemeContext';

const Footer: React.FC = () => {
  const theme = useTheme();
  const { darkMode } = useThemeContext();
  const { settings } = useCompanySettings();
  const currentYear = new Date().getFullYear();

  const currentLogo = darkMode
    ? (settings?.darkLogo || new URL('../../assets/Icon dark background.png', import.meta.url).href)
    : (settings?.lightLogo || new URL('../../assets/icon light background.png', import.meta.url).href);

  const socialLinks = [
    { icon: <Facebook />, url: 'https://facebook.com', tooltip: 'Follow us on Facebook' },
    { icon: <Twitter />, url: 'https://twitter.com', tooltip: 'Follow us on Twitter' },
    { icon: <LinkedIn />, url: 'https://linkedin.com/company', tooltip: 'Connect on LinkedIn' },
  ];

  const footerSections = [
    {
      title: 'Contact Us',
      items: [
        { icon: <Email />, text: settings?.email || 'info@company.com', link: `mailto:${settings?.email || 'info@company.com'}` },
        { icon: <Phone />, text: settings?.phone || '+1234567890', link: `tel:${settings?.phone || '+1234567890'}` },
        { icon: <LocationOn />, text: settings?.address || 'Company Address' },
      ],
    },
    {
      title: 'Quick Links',
      items: [
        { text: 'About Us', link: settings?.website ? `${settings.website}/about` : '#', external: true },
        { text: 'Services', link: settings?.website ? `${settings.website}/services` : '#', external: true },
        { text: 'Support', link: settings?.website ? `${settings.website}/contact` : '#', external: true },
      ],
    },
    {
      title: 'Legal',
      items: [
        { text: 'Privacy Policy', link: settings?.website ? `${settings.website}/privacy` : '#', external: true },
        { text: 'Terms of Service', link: settings?.website ? `${settings.website}/terms` : '#', external: true },
        { text: 'Cookie Policy', link: settings?.website ? `${settings.website}/cookies` : '#', external: true },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        width: '100vw',
        maxWidth: '100%',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(145deg, #1e1e1e, #2d2d2d)'
          : 'linear-gradient(145deg, #f8f9fa, #ffffff)',
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 'auto',
        position: 'relative',
        left: 0,
        right: 0,
        flexShrink: 0,
        transform: 'translateX(0)',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 -4px 12px rgba(0,0,0,0.2)'
          : '0 -4px 12px rgba(0,0,0,0.05)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(90deg, #1976d2, transparent)'
            : 'linear-gradient(90deg, #1976d2, transparent)',
        },
      }}
    >
      <Box
        sx={{
          py: 4,
          px: { xs: 2, sm: 4 },
          maxWidth: '100%',
          margin: '0 auto',
          width: '100%'
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <img
                src={currentLogo}
                alt={settings?.name || 'Company Logo'}
                style={{
                  height: '40px',
                  marginRight: '12px',
                  filter: theme.palette.mode === 'dark' ? 'brightness(1)' : 'brightness(1)',
                }}
              />
            </Box>
            {settings?.website && (
              <Link 
                href={settings.website}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                <Language sx={{ mr: 1 }} />
                {settings.website.replace(/^https?:\/\//, '')}
              </Link>
            )}
          </Grid>
          {footerSections.map((section) => (
            <Grid item xs={12} sm={6} md={3} key={section.title}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                }}
              >
                {section.title}
              </Typography>
              {section.items.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {item.icon && (
                    <Box
                      component="span"
                      sx={{
                        mr: 1,
                        display: 'flex',
                        alignItems: 'center',
                        color: theme.palette.primary.main,
                      }}
                    >
                      {item.icon}
                    </Box>
                  )}
                  {item.link ? (
                    <Link
                      href={item.link}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      sx={{
                        color: 'inherit',
                        textDecoration: 'none',
                        '&:hover': {
                          color: theme.palette.primary.main,
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {item.text}
                    </Link>
                  ) : (
                    <Typography variant="body2">{item.text}</Typography>
                  )}
                </Box>
              ))}
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            pt: 3,
            mt: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
            width: '100%'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {currentYear} {settings?.name || 'Company Name'}. All rights reserved.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'center',
            mt: 2
          }}
        >
          {socialLinks.map((social, index) => (
            <Tooltip key={index} title={social.tooltip}>
              <IconButton
                component="a"
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{
                  color: 'inherit',
                  '&:hover': {
                    color: theme.palette.primary.main,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                {social.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
