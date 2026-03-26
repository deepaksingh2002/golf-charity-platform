import User from '../models/User.model.js';

export const addScore = async (req, res) => {
  try {
    const { value, date } = req.body;
    const user = await User.findById(req.user._id);

    // Ensure we don't exceed 5 items by removing the oldest
    if (user.scores.length >= 5) {
      // Sort ascending by date
      user.scores.sort((a, b) => new Date(a.date) - new Date(b.date));
      // Remove the oldest (first item)
      user.scores.shift();
    }
    
    user.scores.push({ value, date });
    await user.save();

    const sortedScores = user.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.status(201).json(sortedScores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getScores = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const sortedScores = user.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sortedScores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateScore = async (req, res) => {
  try {
    const { value, date } = req.body;
    const { scoreId } = req.params;
    const user = await User.findById(req.user._id);

    const score = user.scores.id(scoreId);
    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }

    if (value !== undefined) score.value = value;
    if (date !== undefined) score.date = date;

    await user.save();

    const sortedScores = user.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sortedScores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteScore = async (req, res) => {
  try {
    const { scoreId } = req.params;
    const user = await User.findById(req.user._id);

    const score = user.scores.id(scoreId);
    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }

    user.scores.pull(scoreId);
    await user.save();

    const sortedScores = user.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sortedScores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
