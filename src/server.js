const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'CI Security Demo',
    checks: [
      { name: 'npm audit', desc: 'Scans installed packages for known vulnerabilities.' },
      { name: 'Semgrep', desc: 'Runs static analysis using simple, readable rules.' },
    ],
  });
});

app.listen(port, () => {
  console.log(`Demo app listening at http://localhost:${port}`);
});
