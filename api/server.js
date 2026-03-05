const express = require('express')
const cors = require('cors')
const newsRouter = require('./routes/news')
const generateRouter = require('./routes/generate')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/news', newsRouter)
app.use('/generate', generateRouter)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`proppulse-api listening on port ${PORT}`)
})
