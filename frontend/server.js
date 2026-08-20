//This file role is only to start the server

import 'dotenv/config';
import './src/config/db.js'; // importing this runs the connection check on startup

import app from './src/app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});