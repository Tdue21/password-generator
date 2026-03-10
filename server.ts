import express, { Request, Response } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')))

// Serve index.html for all routes (SPA)
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Password Generator running at http://localhost:${PORT}`)
})
