import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Version service is running');
});

// Start server
app.listen(port, () => {
  console.log(`Version service listening on port ${port}`);
});
