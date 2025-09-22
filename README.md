# AI-Powered Diagram Builder

A collaborative whiteboard application with AI-powered diagram generation using voice and text commands.

## Features

- 🎤 **Voice Commands**: Record audio to create diagrams with natural language
- 💬 **Text Prompts**: Type requests to generate and modify diagrams  
- 👥 **Real-time Collaboration**: Multiple users can edit whiteboards simultaneously
- 🔐 **Authentication**: Secure user management with AWS Cognito
- 🤖 **AI Integration**: Powered by Google Gemini AI for intelligent diagram generation
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Architecture

- **Frontend**: React with ReactFlow for diagram editing
- **Backend**: AWS Amplify Gen 2 (Lambda functions, DynamoDB, Cognito)
- **AI**: Google Gemini 2.0 Flash for multimodal processing
- **Storage**: DynamoDB for whiteboards, S3 for file storage
- **Real-time**: GraphQL subscriptions for live collaboration

## Quick Start

### Prerequisites

- Node.js 18+ 
- AWS Account
- Google AI Studio API Key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd sematic
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in project root
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run locally**
   ```bash
   # Start frontend
   cd frontend && npm start
   
   # The app will run in local mode with simulation
   ```

### Production Deployment

1. **Configure AWS credentials**
   ```bash
   aws configure
   # Or use AWS environment variables
   ```

2. **Set Gemini API key**
   ```bash
   export GEMINI_API_KEY="your_gemini_api_key_here"
   ```

3. **Deploy to AWS**
   ```bash
   npx ampx sandbox --once
   # For permanent deployment:
   # npx ampx generate --out deployment
   ```

4. **Access your app**
   - The deployment will provide a CloudFront URL
   - Amplify will automatically configure authentication and API endpoints

## Environment Configuration

The app automatically switches between local and production modes:

- **Local Mode**: Uses localStorage, simulation AI, mock authentication
- **Production Mode**: Uses AWS services, real Gemini AI, Cognito authentication

No code changes needed - the same codebase works in both environments!

## Project Structure

```
├── amplify/                 # AWS Amplify configuration
│   ├── auth/               # Cognito authentication
│   ├── data/               # DynamoDB schema  
│   ├── functions/          # Lambda functions
│   └── storage/            # S3 configuration
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── ...
│   └── package.json
├── .env                    # Environment variables (local)
└── README.md
```

## API Reference

### Whiteboard Operations
- `GET /whiteboards` - List user whiteboards
- `POST /whiteboards` - Create new whiteboard  
- `PUT /whiteboards/:id` - Update whiteboard
- `DELETE /whiteboards/:id` - Delete whiteboard

### AI Processing
- `POST /ai-process` - Process AI diagram requests
  - Supports text prompts, voice commands, and image input
  - Returns series of diagram modification commands

### Real-time Collaboration
- GraphQL subscriptions for live whiteboard updates
- WebSocket connections for real-time editing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally and with production build
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the [Issues](../../issues) page
- Review deployment logs in AWS CloudWatch
- Verify Gemini API key configuration