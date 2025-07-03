const logger = {
  log: async (message: string, data?: any) => {
    const env = import.meta.env.VITE_ENV;

    let loggerUrl = '';
    if (env === 'development') {
      loggerUrl = import.meta.env.VITE_LOGGER_URL || 'http://localhost:3001/log';
    } else {
      loggerUrl = import.meta.env.VITE_LOGGER_URL || '';
    }

    if (env === 'local' || env === 'test') {
      console.log(`[LOG] ${message}`, data || '');
    } else if (env === 'development' || env === 'stage') {
      if (loggerUrl) {
        try {
          const response = await fetch(loggerUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, data }),
          });

          if (!response.ok) {
            console.error(
              '[LOGGER ERROR]',
              `Failed to send log: ${response.statusText}`
            );
          }
        } catch (error) {
          console.error('[LOGGER ERROR]', error);
        }
      } else {
        console.warn('[LOGGER WARNING] Logger URL is not defined');
      }
    } else {
      console.warn(
        `[LOG] ${message} (No logging configured for environment: ${env})`
      );
    }
  },

  error: async (message: string, error?: any) => {
    const env = import.meta.env.VITE_ENV;

    let loggerUrl = '';
    if (env === 'development') {
      loggerUrl = import.meta.env.VITE_LOGGER_URL || 'http://localhost:3001/log';
    } else {
      loggerUrl = import.meta.env.VITE_LOGGER_URL || '';
    }

    if (env === 'local' || env === 'test') {
      console.error(`[ERROR] ${message}`, error || '');
    } else if (env === 'development' || env === 'stage') {
      if (loggerUrl) {
        try {
          const response = await fetch(loggerUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ level: 'error', message, error }),
          });

          if (!response.ok) {
            console.error(
              '[LOGGER ERROR]',
              `Failed to send error log: ${response.statusText}`
            );
          }
        } catch (err) {
          console.error('[LOGGER ERROR]', err);
        }
      } else {
        console.warn('[LOGGER WARNING] Logger URL is not defined');
      }
    } else {
      console.warn(
        `[ERROR] ${message} (No logging configured for environment: ${env})`
      );
    }
  },
};

export default logger;
