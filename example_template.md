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

## Alternative: Row-Based Format

## How to Use

1. **Parameter_Name**: 
   - For inputs, use prefix 'IP_' (e.g., IP_Amount, IP_Rate)
   - For outputs, use prefix 'OP_' (e.g., OP_Total, OP_Interest)
2. **Parameter_Type**: Either 'Input' or 'Output'
3. **Data_Type**: The expected data type (number, string, boolean)
4. **Value**: Default value for inputs (optional)
5. **Formula**: Excel formula using the IP_ and OP_ prefixed names (required for outputs)

## Example Use Cases

### Financial Calculations
```
Parameter_Name  | Parameter_Type | Data_Type | Value | Formula
IP_Principal    | Input         | number    | 1000  |
IP_Rate         | Input         | number    | 0.05  |
IP_Time         | Input         | number    | 2     |
OP_Interest     | Output        | number    |       | =IP_Principal*IP_Rate*IP_Time
OP_TotalAmount  | Output        | number    |       | =IP_Principal+OP_Interest
```

### Discount Calculator
```
Parameter_Name    | Parameter_Type | Data_Type | Value | Formula
IP_Price         | Input         | number    | 200   |
IP_Discount      | Input         | number    | 20    |
OP_DiscountAmt   | Output        | number    |       | =IP_Price*(IP_Discount/100)
OP_FinalPrice    | Output        | number    |       | =IP_Price-OP_DiscountAmt
```

### Grade Calculator
```
Parameter_Name    | Parameter_Type | Data_Type | Value | Formula
IP_Assignment1   | Input         | number    | 85    |
IP_Assignment2   | Input         | number    | 90    |
IP_Midterm       | Input         | number    | 78    |
IP_Final         | Input         | number    | 88    |
OP_FinalGrade    | Output        | number    |       | =(IP_Assignment1*0.2)+(IP_Assignment2*0.2)+(IP_Midterm*0.3)+(IP_Final*0.3)
OP_LetterGrade   | Output        | string    |       | =IF(OP_FinalGrade>=90,"A",IF(OP_FinalGrade>=80,"B",IF(OP_FinalGrade>=70,"C","F")))
```

These examples demonstrate how to structure your Excel file using IP_ prefix for inputs and OP_ prefix for outputs. The system will process these parameters and execute the formulas based on the provided input values. Using these prefixes helps in clearly identifying input and output parameters and makes the formulas more readable and maintainable.