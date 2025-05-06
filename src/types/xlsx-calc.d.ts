// types/xlsx-calc.d.ts
declare module 'xlsx-calc' {
    import { WorkBook } from 'xlsx';
  
    function XlsxCalc(workbook: WorkBook): void;
  
    namespace XlsxCalc {
      function exec(workbook: WorkBook): void;
    }
  
    export = XlsxCalc;
  }
  