# Installation and Setup Guide

## Prerequisites

### System Requirements
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Development Tools
- Git for version control
- A code editor (VS Code recommended)
- Postman or similar API testing tool

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd rules-manager
```

### 2. Environment Setup

1. Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=rules_manager

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# File Upload Configuration
MAX_FILE_SIZE=5mb
UPLOAD_DIR=./uploads
```

2. Configure PostgreSQL:
   - Create a new database named 'rules_manager'
   - Update `.env` with your database credentials

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Migration
```bash
npm run migration:run
```

### 5. Build the Project
```bash
npm run build
```

### 6. Start the Server
```bash
npm start
```

## Development Setup

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test                 # Run all tests
npm run test:coverage    # Run tests with coverage report
```

### Code Linting
```bash
npm run lint            # Check code style
npm run lint:fix        # Fix code style issues
```

## Project Structure

```
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Database entities
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Helper functions
│   ├── config/          # Configuration files
│   └── app.ts           # Application entry point
├── test/                # Test files
├── uploads/             # Temporary file storage
└── package.json         # Project dependencies
```

## Configuration

### Database Configuration
The database configuration is managed through TypeORM. The configuration file is located at `src/config/ormconfig.ts`:

```typescript
export default {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['src/models/*.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development'
};
```

### Security Configuration

1. **JWT Authentication**
   - Configure JWT secret in `.env`
   - Adjust token expiration time
   - Implement role-based access control

2. **File Upload Security**
   - Set maximum file size limits
   - Configure allowed file types
   - Implement virus scanning (optional)

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure database exists

2. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure correct file types

3. **Build Errors**
   - Clear node_modules and reinstall
   - Update TypeScript version
   - Check for syntax errors

### Getting Help
- Check the [GitHub Issues](https://github.com/your-repo/issues)
- Join our [Discord Community](https://discord.gg/your-server)
- Contact support at support@your-domain.com

## Next Steps
- Read the [API Documentation](./api-documentation.md)
- Explore [Flow Execution Guide](./flow-execution-guide.md)
- Check [Usage Examples](../USAGE.md)