# Business Requirements Document - Rules Manager

## Overview
Rules Manager is a robust system designed to manage, version, and execute business rules defined in Excel spreadsheets through a RESTful API interface. The system allows organizations to maintain their business logic in familiar Excel format while providing programmatic access for rule execution.

## System Architecture

### Core Components
1. **API Layer**
   - RESTful endpoints for category management, version control, and rule execution
   - Input validation and error handling
   - Response formatting and status codes

2. **Storage System**
   - File-based storage for Excel rule files
   - UUID-based file naming for uniqueness
   - Version tracking in database with file references
   - Metadata storage for input/output mappings

3. **Rule Processing Engine**
   - Excel formula interpretation
   - Input mapping to named ranges
   - Output calculation and extraction

## Functional Specifications

### 1. Rule Categories
- Logical grouping of related business rules
- Metadata includes name, description, and creation timestamp
- Unique identifier (UUID) for each category
- Support for multiple active versions within a category

### 2. File Upload System
#### Process Flow
1. **File Validation**
   - Verify Excel format (.xlsx)
   - Check for required named ranges (IP_* for inputs, OP_* for outputs)
   - Validate formula integrity

2. **Storage Mechanism**
   - Generate unique filename using UUID
   - Store in designated uploads directory
   - Create database record with file metadata
   - Extract and store input/output column mappings

3. **Version Management**
   - Optional version string support
   - Automatic version incrementing if not specified
   - Active/inactive version tracking

### 3. Rule Execution System
#### Execution Flow
1. **Input Processing**
   - Receive JSON payload with input parameters
   - Validate against defined IP_* columns
   - Map inputs to corresponding Excel cells

2. **Calculation Engine**
   - Load Excel file from storage
   - Apply input values to named ranges
   - Execute Excel formulas
   - Extract results from OP_* named ranges

3. **Response Generation**
   - Format calculated outputs as JSON
   - Include all OP_* values in response
   - Handle calculation errors gracefully

## API Specifications

### Categories API
- **POST /api/categories**
  - Create new rule category
  - Required: name, description

### Versions API
- **POST /api/categories/:categoryId/versions**
  - Upload new rule version
  - Multipart form data with Excel file
  - Optional version string

### Execution API
- **POST /api/execute/:categoryId**
  - Execute rules for given category
  - JSON payload with input parameters
  - Returns calculated outputs

## Data Model

### RuleCategory
- id (UUID)
- name (string)
- description (text)
- createdAt (timestamp)
- updatedAt (timestamp)

### RuleVersion
- id (UUID)
- categoryId (UUID, foreign key)
- version (string)
- isActive (boolean)
- filePath (string)
- inputColumns (string[])
- outputColumns (string[])
- createdAt (timestamp)
- updatedAt (timestamp)

## Security Considerations
1. Input validation to prevent formula injection
2. File size limits for uploads
3. API authentication and authorization
4. Rate limiting for execution endpoints

## Error Handling
1. Invalid input format
2. Missing required parameters
3. Formula calculation errors
4. File storage issues
5. Version conflicts

## Performance Considerations
1. Caching of frequently used rules
2. Optimized Excel file loading
3. Parallel execution support
4. Database query optimization

## Limitations
1. Supported Excel formula subset
2. Maximum file size restrictions
3. Input/output column naming conventions
4. Version management constraints

## Future Enhancements
1. Rule template library
2. Batch execution support
3. Real-time rule updates
4. Advanced formula validation
5. Integration with external systems