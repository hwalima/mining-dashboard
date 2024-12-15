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

const logoLight = new URL('../../assets/icon light background.png', import.meta.url).href;
const logoDark = new URL('../../assets/Icon dark background.png', import.meta.url).href;

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const currentLogo = theme.palette.mode === 'dark' ? logoDark : logoLight;

  const socialLinks = [
    { icon: <Facebook />, url: 'https://facebook.com/hwalimadigital', tooltip: 'Follow us on Facebook' },
    { icon: <Twitter />, url: 'https://twitter.com/hwalimadigital', tooltip: 'Follow us on Twitter' },
    { icon: <LinkedIn />, url: 'https://linkedin.com/company/hwalimadigital', tooltip: 'Connect on LinkedIn' },
  ];

  const footerSections = [
    {
      title: 'Contact Us',
      items: [
        { icon: <Email />, text: 'info@hwalima.digital', link: 'mailto:info@hwalima.digital' },
        { icon: <Phone />, text: '+27 78 542 5978', link: 'tel:+27785425978' },
        { icon: <LocationOn />, text: 'Johannesburg, South Africa' },
      ],
    },
    {
      title: 'Quick Links',
      items: [
        { text: 'About Us', link: 'https://www.hwalima.digital/about' },
        { text: 'Services', link: 'https://www.hwalima.digital/services' },
        { text: 'Support', link: 'https://www.hwalima.digital/contacts/' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { text: 'Privacy Policy', link: 'https://www.hwalima.digital/privacy' },
        { text: 'Terms of Service', link: 'https://www.hwalima.digital/terms' },
        { text: 'Cookie Policy', link: 'https://www.hwalima.digital/cookies' },
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
                alt="Hwalima Digital Logo"
                style={{
                  height: '40px',
                  marginRight: '12px',
                  filter: theme.palette.mode === 'dark' ? 'brightness(1)' : 'brightness(1)',
                }}
              />
            </Box>
            <Link 
              href="https://www.hwalima.digital" 
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
              www.hwalima.digital
            </Link>
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
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'inherit',
                        textDecoration: 'none',
                        '&:hover': {
                          color: theme.palette.primary.main,
                        },
                        transition: 'color 0.2s',
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
            {currentYear} Hwalima Digital. All rights reserved.
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
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
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
