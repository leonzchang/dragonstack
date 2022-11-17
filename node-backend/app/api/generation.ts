import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ generation: req.app.locals.engine.generation });
});

export default router;
