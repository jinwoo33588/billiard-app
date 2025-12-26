import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import App from './App';
import './index.css';

const theme = createTheme({
  // 모바일 기본 spacing/radius를 좀 더 타이트하게
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
  },
  radius: {
    sm: '10px',
    md: '14px',
    lg: '18px',
  },
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '15px',
    lg: '18px',
    xl: '20px',
  },

  // ✅ 컴포넌트 기본 props 강제 (핵심)
  components: {
    Container: {
      defaultProps: {
        fluid: true,
        px: 0, // 전역적으로 좌우패딩 제거
      },
    },
    Card: {
      defaultProps: {
        p: 'sm',
        radius: 'md',
        withBorder: true,
        shadow: 'none',
      },
      styles: {
        root: {
          backgroundColor: 'transparent', // ⭐ 배경과 동일
          borderColor: 'var(--mantine-color-gray-3)',
        },
      },
    },
    Stack: {
      defaultProps: {
        gap: 'sm',
      },
    },
    Group: {
      defaultProps: {
        gap: 'xs',
        wrap: 'wrap',
      },
    },
    Button: {
      defaultProps: {
        radius: 'xl',
        size: 'xs',
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
);