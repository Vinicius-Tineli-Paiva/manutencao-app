import { createTheme } from '@mui/material/styles';
import { lightBlue, grey, green, red, orange } from '@mui/material/colors';

const primaryColor = lightBlue[700]; 
const secondaryColor = grey[700];    
const successColor = green[600];   
const errorColor = red[600];  
const warningColor = orange[600]; 
const infoColor = lightBlue[400]; 

const theme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
      light: lightBlue[400],
      dark: lightBlue[800],
      contrastText: '#fff', 
    },
    secondary: {
      main: secondaryColor,
      light: grey[400],
      dark: grey[800],
      contrastText: '#fff',
    },
    success: {
      main: successColor,
    },
    error: {
      main: errorColor,
    },
    warning: {
      main: warningColor,
    },
    info: {
      main: infoColor,
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',   
    },
    text: {
      primary: grey[900],
      secondary: grey[600], 
    },
  },
  typography: {
    fontFamily: [
      'Roboto', 
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600, 
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem', 
    },
    body2: {
      fontSize: '0.875rem', 
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', 
          borderRadius: 8, 
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, 
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', 
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8, 
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 8, 
          '&:last-child': {
            marginBottom: 0, 
          },
        },
      },
    },
  },
});

export default theme;