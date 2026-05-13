import express from 'express';
import LabTest from '../models/LabTest.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim()) {
      const keywords = search.trim().split(/\s+/);
      const searchQueries = keywords.map(kw => ({
        $or: [
          { name: { $regex: kw, $options: 'i' } },
          { description: { $regex: kw, $options: 'i' } },
          { brand: { $regex: kw, $options: 'i' } },
          { category: { $regex: kw, $options: 'i' } }
        ]
      }));
      query = { $and: searchQueries };
    }

    const tests = await LabTest.find(query).limit(10);
    res.json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
