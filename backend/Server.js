import express from 'express';
import data from './data.js';

const app = express();

app.get('/api/product', (req, res) => {
  res.send(data.product);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `Best True Value Hardware app listening at http://localhost:${port}`
  );
});
