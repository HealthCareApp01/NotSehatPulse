import express from 'express';
import Medicine from '../models/Medicine.js';

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

    const medicines = await Medicine.find(query).limit(10);
    res.json({ success: true, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
