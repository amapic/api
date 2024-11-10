const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Chemin vers le fichier JSON
const dataPath = path.join(__dirname, 'data', 'sections.json');
const TEXTS_FILE = path.join(__dirname, 'data', 'texts.json');
// Fonction utilitaire pour lire/écrire le fichier JSON
async function readData() {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { sections: [] };
  }
}

async function writeData(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}

// Routes
app.get('/sections', async (req, res) => {
	// console.log("dgfsfgg")
  try {
    // const data = await readData();
	const data = await readData();
	// console.log('Data being sent:', data.sections);
    res.json(data.sections);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture des sections' });
  }
});

app.get('/sections/:id', async (req, res) => {
	// console.log("dgfsfgg")
  try {
    // const data = await readData();
	const data = await readData();
	// console.log(id);
    res.json(data.sections);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la lecture des sections' });
  }
});

app.post('/sections', async (req, res) => {
  try {
    const data = await readData();
    const newSection = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    console.log("ajout")
    data.sections.push(newSection);
    await writeData(data);
    
    res.status(201).json(newSection);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la section' });
  }
});

app.delete('/sections/:id', async (req, res) => {
	console.log("desctruction")
  try {
    const data = await readData();
    data.sections = data.sections.filter(section => section.id !== req.params.id);
    await writeData(data);
	console.log("desctruction",req.params.id)
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la section' });
  }
});

app.put('/sections/:id', async (req, res) => {
  try {
    const data = await readData();
    data.sections = data.sections.map(section => 
      section.id === req.params.id 
        ? { ...section, ...req.body, updatedAt: new Date().toISOString() }
        : section
    );
    await writeData(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la section' });
  }
});




// const TEXTS_FILE = path.join(__dirname, '../data/texts.json');

// Lire les textes
app.get('/api/texts', async (req, res) => {
  try {
    const data = await fs.readFile(TEXTS_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData.texts);
  } catch (error) {
    console.error('Error reading texts:', error);
    res.status(500).json({ error: 'Failed to read texts' });
  }
});

// Mettre à jour un texte
app.post('/api/texts', async (req, res) => {
  try {
    const { key, value } = req.body;
    const data = await fs.readFile(TEXTS_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    
    if (!(key in jsonData.texts)) {
      return res.status(400).json({ error: 'Invalid text key' });
    }
    
    jsonData.texts[key] = value;
    await fs.writeFile(TEXTS_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
    
    res.json(jsonData.texts);
  } catch (error) {
    console.error('Error updating texts:', error);
    res.status(500).json({ error: 'Failed to update texts' });
  }
});

// Récupérer toutes les cartes
app.get('/api/cards', async (req, res) => {
  try {
    const data = await fs.readFile(TEXTS_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData.cards);
  } catch (error) {
    console.error('Error reading cards:', error);
    res.status(500).json({ error: 'Failed to read cards' });
  }
});

// Ajouter une nouvelle carte
app.post('/api/cards', async (req, res) => {
  try {
    const { icon, title, content } = req.body;
    const data = await fs.readFile(TEXTS_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    
    const newCard = {
      id: Date.now().toString(), // Génère un ID unique
      icon,
      title,
      content
    };
    
    jsonData.cards.push(newCard);
    await fs.writeFile(TEXTS_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
    
    res.json(newCard);
  } catch (error) {
    console.error('Error adding card:', error);
    res.status(500).json({ error: 'Failed to add card' });
  }
});

// Supprimer une carte
app.delete('/api/cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(TEXTS_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    
    // S'assurer que cards existe
    if (!jsonData.cards) {
      return res.status(404).json({ error: 'No cards found' });
    }
    
    // Vérifier si la carte existe
    const cardIndex = jsonData.cards.findIndex(card => card.id === id);
    if (cardIndex === -1) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Supprimer la carte
    jsonData.cards = jsonData.cards.filter(card => card.id !== id);
    await fs.writeFile(TEXTS_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});
var env = process.env.NODE_ENV || 'development';
console.log(env)
app.listen(3000, () => console.log("Server ready on port 3000."));

// Vercel serverless function handler
module.exports = app;
