# Rules Manager

A powerful rules management system that allows users to define business rules through Excel files using named ranges and expose them as APIs. The system supports version control, rule categorization, and dynamic rule execution through RESTful endpoints.

## Features

- **Rule Categories**: Organize rules into logical categories for better management
- **Version Control**: Maintain multiple versions of rules within each category with active/inactive status
- **Excel File Support**: Upload rules defined in Excel spreadsheets using named ranges
- **Named Range Processing**: Support for IP_ (input) and OP_ (output) prefixed named ranges
- **Excel Formula Support**: Process Excel formulas for complex rule calculations
- **Flexible Parameter Format**: Support for both named ranges and traditional row-based format
- **API Endpoints**: Access rules through RESTful APIs with version control
- **Dynamic Rule Execution**: Execute rules with custom input parameters
- **Version Management**: Enable/disable specific rule versions for controlled deployment

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

### Rule Versions
- `POST /api/categories/:id/versions` - Upload new rule version
- `GET /api/categories/:id/versions` - List versions for a category
- `PATCH /api/versions/:id` - Update version status (enable/disable)

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

## Usage Example

1. Create a rule category:
   ```bash
   curl -X POST http://localhost:3000/api/categories \
     -H "Content-Type: application/json" \
     -d '{"name": "Calculation Rules", "description": "Basic arithmetic operations"}'
   ```

2. Upload a rule version (Excel file):
   ```bash
   curl -X POST http://localhost:3000/api/categories/:categoryId/versions \
     -F "file=@rules.xlsx"
   ```

3. Execute rules:
   ```bash
   curl -X POST http://localhost:3000/api/execute/:categoryId \
     -H "Content-Type: application/json" \
     -d '{"IP_A1": 20, "IP_A2": 30}'
   ```

## License

MIT