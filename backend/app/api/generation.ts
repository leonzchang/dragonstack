import { Router } from 'express'

const router = Router()

export default router.get('/', (req, res) => {
    res.json({ generation: req.app.locals.engine.generation })
})
