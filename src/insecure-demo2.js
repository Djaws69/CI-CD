// Fichier volontairement vulnerable pour tester les scans Semgrep et npm audit.
const express = require('express');
const { exec } = require('child_process');

const router = express.Router();

// Command injection : exécute directement la query string "cmd".
router.get('/exec', (req, res) => {
  const userCmd = req.query.cmd || 'echo missing-cmd';
  exec(userCmd, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).send(`Erreur commande: ${err.message}`);
    }
    res.type('text/plain').send(`Commande: ${userCmd}\nstdout: ${stdout}\nstderr: ${stderr}`);
  });
});

// Eval input : vulnérable à l'évaluation arbitraire.
router.post('/eval', express.urlencoded({ extended: true }), (req, res) => {
  const payload = req.body.code || '';
  try {
    // Ne JAMAIS faire ça en production
    const result = eval(payload);
    res.send(`Résultat: ${result}`);
  } catch (e) {
    res.status(500).send(`Erreur eval: ${e.message}`);
  }
});

module.exports = router;
