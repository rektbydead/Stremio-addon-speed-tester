import express from 'express'
import { streamHandler, builder } from "./addon.js";

const app = express()
const port = 7000

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
	next()
})

app.get('/manifest.json', (req, res) => {
	res.setHeader('Content-Type', 'application/json')
	res.end(JSON.stringify(builder.getInterface().manifest))
})

app.get('/stream/:type/:id.json', async (req, res) => {
	const { type, id } = req.params

	const result = await streamHandler({ type, id })

	res.setHeader('Content-Type', 'application/json')
	res.end(JSON.stringify(result))
})

app.listen(port, () => {
	console.log(`🚀 Addon running at http://localhost:${port}/manifest.json`)
})