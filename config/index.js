const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.join(__dirname, './../.env') })

module.exports = {
  port: process.env.PORT || 4100,
  clientURL: process.env.CLIENT_URL,
  email: {userEmail: process.env.EMAIL_USER, password: process.env.EMAIL_PASSWORD},
  jwtKey: process.env.JWT_SECRET || 'outder',
  mongoose: {
    connectionString: process.env.DATABASE_URL,
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true
    }
  }
}