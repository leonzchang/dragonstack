import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import GenerationEngine from './generation/engine'
import dragonRouter from './api/dragon'
import generationRouter from './api/generation'

const app = express()
const engine = new GenerationEngine()

app.locals.engine = engine

app.use(cors({origin: 'http://localhost:1234'}))

app.use('/dragon', dragonRouter)
app.use('/generation', generationRouter)

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = error.statusCode || 500

    res.status(statusCode).json({
        type: 'error', message: error.message
    })
})

engine.start()


export default app