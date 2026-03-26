import Charity from '../models/Charity.model.js';

export const getCharities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const charities = await Charity.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(charities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCharity = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity || !charity.isActive) return res.status(404).json({ message: 'Charity not found' });
    res.json(charity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCharity = async (req, res) => {
  try {
    const { name, description, website, imageUrl, galleryImages } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const charity = await Charity.create({
      name, description, website, imageUrl, galleryImages
    });
    res.status(201).json(charity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!charity) return res.status(404).json({ message: 'Charity not found' });
    res.json(charity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!charity) return res.status(404).json({ message: 'Charity not found' });
    res.json({ message: 'Charity disabled', charity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleFeatured = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ message: 'Charity not found' });
    charity.isFeatured = !charity.isFeatured;
    await charity.save();
    res.json(charity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addEvent = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ message: 'Charity not found' });
    charity.upcomingEvents.push(req.body);
    await charity.save();
    res.json(charity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
