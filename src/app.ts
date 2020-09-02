import express from 'express'
import { Request, Response } from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
var cors = require('cors')

// Controllers (route handlers)
import * as postsController from './controllers/posts'

// Create Express server
const app = express()

// Set enviroment type.
const env = app.get('env')

// Express configuration
app.set('port', process.env.PORT || 9000)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.disable('x-powered-by') // remove header
app.disable('etag')

if (env === 'production') {
  app.use(cors({ credentials: true, origin: 'https://testing.com' }))
} else {
  app.use(cors())
}
// Express request logging
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
  ),
)

// Health status route
app.get('/', (req: Request, res: Response) => {  
  res.end()
})

// API Routes
app.get('/posts', postsController.getPosts)

export default app
