# Rules Manager

A powerful business rules engine that transforms Excel-based business logic into RESTful APIs. Define your business rules using Excel's named ranges and formulas, then expose them as versioned API endpoints for seamless integration into your applications.

## Key Features

- **Excel-Based Rule Definition**
  - Use familiar Excel formulas and functions
  - Define inputs and outputs using named ranges (IP_ and OP_ prefixes)
  - Support for complex calculations and conditional logic

- **Robust Version Control**
  - Maintain multiple versions of rule sets
  - Active/inactive version management
  - Rollback capability for rule changes

- **Flexible Rule Organization**
  - Categorize rules by business domain
  - Group related rules for better maintainability
  - Easy navigation and management

- **RESTful API Integration**
  - Automatic API endpoint generation
  - JSON request/response format
  - Comprehensive API documentation

- **Enterprise-Ready Features**
  - Input validation and error handling
  - Execution history tracking
  - Performance optimization for large rule sets

- **Parallel Flow Execution with Conditions**
  - Execute multiple paths concurrently
  - Evaluate conditions before executing nodes
  - Synchronize results at convergence points
  - Apply transforms to data before passing to target nodes

For detailed usage instructions and examples, see [USAGE.md](./USAGE.md).

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Architecture**: MVC (Model-View-Controller)

## Project Structure

```
├── src/
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── models/             # Database entities
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Helper functions
│   ├── config/             # Configuration files
│   └── app.ts              # Application entry point
├── test/                   # Test files
├── uploads/                # Temporary file storage
└── package.json            # Project dependencies
```

## Database Schema

### RuleCategory
- id: UUID (Primary Key)
- name: string
- description: string
- createdAt: timestamp
- updatedAt: timestamp

### RuleVersion
- id: UUID (Primary Key)
- categoryId: UUID (Foreign Key)
- version: string
- isActive: boolean
- filePath: string
- inputColumns: jsonb
- outputColumns: jsonb
- createdAt: timestamp
- updatedAt: timestamp

## API Endpoints

### Rule Categories
- `POST /api/categories` - Create a new rule category
- `GET /api/categories` - List all rule categories
- `GET /api/categories/:id` - Get category details
- `PATCH /api/categories/:id` - Update category details
- `DELETE /api/categories/:id` - Delete a category

### Rule Versions
- `POST /api/categories/:id/versions` - Upload new rule version
- `GET /api/categories/:id/versions` - List versions for a category
- `PATCH /api/versions/:id` - Update version status (enable/disable)
- `DELETE /api/versions/:id` - Delete a version
- `GET /api/versions/:id` - Get version details
- `POST /api/versions/:id/execute` - Execute a version with custom parameters
- `GET /api/versions/:id/execute` - Get execution history for a version


### Rule Execution
- `POST /api/execute/:categoryId` - Execute rules for a category

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=rules_manager
   ```
4. Run database migrations:
   ```bash
   npm run typeorm migration:run
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## License

MIT
