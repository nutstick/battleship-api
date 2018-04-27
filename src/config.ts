if (process.env.BROWSER) {
  throw new Error('Do not import `config.js` from inside the client-side code.');
}

export const port = process.env.PORT || 3000;
export const host = process.env.WEBSITE_HOSTNAME || `localhost:${port}`;

export const mongodb = process.env.NODE_ENV === 'test' ? 'test-battleship' : process.env.MONGODB || `battleship`;
