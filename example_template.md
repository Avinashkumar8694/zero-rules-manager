# Example Excel Template

Here's how to structure your Excel file for the Rules Manager. The system supports both named ranges and traditional row-based formats.

## Using Named Ranges (Recommended)

1. Create named ranges in Excel with specific prefixes:
   - Use `IP_` prefix for input cells (e.g., `IP_Amount`, `IP_Rate`)
   - Use `OP_` prefix for output cells (e.g., `OP_Total`, `OP_Interest`)

2. Define your formulas using the named ranges:
   ```
   IP_Amount = A1    (cell contains numeric value)
   IP_Rate = B1      (cell contains numeric value)
   IP_Years = C1     (cell contains numeric value)
   OP_Interest = D1  (cell contains formula =IP_Amount*IP_Rate)
   OP_Total = E1     (cell contains formula =IP_Amount+OP_Interest*IP_Years)
   ```


These examples demonstrate how to structure your Excel file using IP_ prefix for inputs and OP_ prefix for outputs. The system will process these parameters and execute the formulas based on the provided input values. Using these prefixes helps in clearly identifying input and output parameters and makes the formulas more readable and maintainable.