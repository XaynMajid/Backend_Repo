const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Mechanic = require('../models/Mechanic');

// Update mechanic location
router.post('/location/update', auth, async (req, res) => {
  try {
    const { location } = req.body;
    
    if (!location || !location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return res.status(400).json({ message: 'Invalid location data' });
    }

    console.log('Updating location for mechanic:', req.user.mechanicId);
    console.log('Location data:', location);

    const mechanic = await Mechanic.findById(req.user.mechanicId);
    
    if (!mechanic) {
      console.error('Mechanic not found:', req.user.mechanicId);
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    mechanic.location = {
      type: 'Point',
      coordinates: location.coordinates
    };

    await mechanic.save();
    console.log('Location updated successfully');

    res.json(mechanic);
  } catch (err) {
    console.error('Error updating mechanic location:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update mechanic status
router.post('/status/update', auth, async (req, res) => {
  try {
    const { isLive } = req.body;
    
    const mechanic = await Mechanic.findById(req.user.mechanicId);
    
    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    mechanic.isLive = isLive;
    await mechanic.save();

    res.json(mechanic);
  } catch (err) {
    console.error('Error updating mechanic status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 