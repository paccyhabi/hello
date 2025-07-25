# Hello App - Node.js Backend with MySQL

A comprehensive Node.js backend for the Hello TikTok-like mobile application using MySQL database.

## Features

- **User Authentication**: Email/phone registration and login with JWT
- **Video Management**: Upload, view, like, comment, and share videos
- **Social Features**: Follow/unfollow users, user profiles, search
- **Real-time Chat**: Private and group messaging with Socket.io
- **Points System**: Earn, send, and withdraw points
- **Payment Integration**: Stripe for purchases, mobile money support
- **File Upload**: Cloudinary integration for videos and images
- **Push Notifications**: Email, SMS, and push notification support

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **File Storage**: Cloudinary
- **Payments**: Stripe
- **Notifications**: Nodemailer + Twilio

## Database Schema

### Core Tables
- **users**: User accounts and profiles
- **videos**: Video content and metadata
- **video_likes**: Video like relationships
- **video_comments**: Video comments and replies
- **video_shares**: Video sharing tracking
- **follows**: User follow relationships
- **chats**: Chat rooms (private/group)
- **chat_participants**: Chat membership
- **messages**: Chat messages
- **points_transactions**: Points earning/spending history

## Installation

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Set up MySQL database**:
   ```sql
   CREATE DATABASE hello_app;
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   Fill in your database credentials and API keys

5. **Run database migrations**:
   ```bash
   npm run migrate
   ```

6. **Start the server**:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/forgot-password` - Request password reset

### Users
- `GET /api/users/:username` - Get user profile
- `POST /api/users/:id/follow` - Follow/unfollow user
- `PUT /api/users/profile` - Update profile
- `GET /api/users/search/users` - Search users
- `GET /api/users/trending/users` - Get trending users

### Videos
- `GET /api/videos/feed` - Get video feed
- `POST /api/videos/upload` - Upload video
- `POST /api/videos/:id/like` - Like/unlike video
- `POST /api/videos/:id/comment` - Add comment
- `POST /api/videos/:id/share` - Share video
- `GET /api/videos/search` - Search videos

### Chat
- `GET /api/chat` - Get user's chats
- `POST /api/chat/private` - Create private chat
- `POST /api/chat/group` - Create group chat
- `GET /api/chat/:chatId/messages` - Get messages
- `POST /api/chat/:chatId/messages` - Send message

### Points
- `GET /api/points` - Get points balance and transactions
- `POST /api/points/send` - Send points to user
- `GET /api/points/leaderboard` - Get points leaderboard
- `GET /api/points/stats` - Get user's points statistics

### Payments
- `GET /api/payments/packages` - Get points packages
- `POST /api/payments/purchase-points` - Purchase points
- `POST /api/payments/withdraw` - Request withdrawal
- `GET /api/payments/withdrawals` - Get withdrawal history

## Socket.io Events

### Connection
- `connection` - User connects
- `disconnect` - User disconnects

### Chat
- `join_chats` - Join user's chat rooms
- `send_message` - Send message
- `new_message` - Receive new message
- `typing_start` / `typing_stop` - Typing indicators

### Video Calls
- `call_user` - Initiate call
- `answer_call` - Answer call
- `reject_call` - Reject call
- `end_call` - End call

### Live Streaming
- `start_live_stream` - Start live stream
- `join_live_stream` - Join live stream
- `live_stream_comment` - Comment on live stream

## Database Models

### User Model
- Authentication (email/phone, password)
- Profile information (username, display name, avatar, bio)
- Points and level system
- Settings and preferences

### Video Model
- Video metadata (title, description, duration)
- File URLs (video, thumbnail)
- Social interactions tracking
- View analytics

### Chat & Message Models
- Private and group chat support
- Message history with media support
- Read receipts and typing indicators

### Points System
- Transaction history tracking
- Points earning and spending
- Payment and withdrawal records

## Security Features

- JWT authentication with expiration
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet for security headers

## Deployment

1. Set up MySQL database server
2. Configure Cloudinary account
3. Set up Stripe account for payments
4. Configure email and SMS services
5. Set environment variables
6. Deploy to your preferred platform

## Environment Variables

See `.env.example` for all required environment variables including:
- Database connection details
- JWT secret key
- Cloudinary credentials
- Stripe API keys
- Email/SMS service credentials

## Development

```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate

# Start development server
npm run dev

# Run tests
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.