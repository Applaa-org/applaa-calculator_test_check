"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  RotateCcw, 
  History, 
  Calculator as CalculatorIcon,
  Square,
  Pi,
  Infinity,
  Percent,
  Eraser
} from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isScientific, setIsScientific] = useState(true);

  const addToHistory = useCallback((expression: string, result: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: new Date()
    };
    setHistory(prev => [newItem, ...prev.slice(0, 49)]); // Keep last 50 items
  }, []);

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        if (secondValue === 0) {
          showError("Cannot divide by zero");
          return firstValue;
        }
        return firstValue / secondValue;
      case "^":
        return Math.pow(firstValue, secondValue);
      default:
        return secondValue;
    }
  };

  const handleNumberClick = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleDecimalClick = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const handleOperationClick = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const handleEqualsClick = () => {
    if (previousValue !== null && operation) {
      const inputValue = parseFloat(display);
      const newValue = calculate(previousValue, inputValue, operation);
      
      const expression = `${previousValue} ${operation} ${inputValue}`;
      addToHistory(expression, String(newValue));
      
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handleClearClick = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const handleBackspaceClick = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const handleScientificFunction = (func: string) => {
    const inputValue = parseFloat(display);
    let result: number;

    try {
      switch (func) {
        case "sin":
          result = Math.sin(inputValue * Math.PI / 180);
          break;
        case "cos":
          result = Math.cos(inputValue * Math.PI / 180);
          break;
        case "tan":
          result = Math.tan(inputValue * Math.PI / 180);
          break;
        case "log":
          if (inputValue <= 0) {
            showError("Logarithm undefined for non-positive values");
            return;
          }
          result = Math.log10(inputValue);
          break;
        case "ln":
          if (inputValue <= 0) {
            showError("Natural logarithm undefined for non-positive values");
            return;
          }
          result = Math.log(inputValue);
          break;
        case "sqrt":
          if (inputValue < 0) {
            showError("Square root undefined for negative values");
            return;
          }
          result = Math.sqrt(inputValue);
          break;
        case "x²":
          result = inputValue * inputValue;
          break;
        case "1/x":
          if (inputValue === 0) {
            showError("Cannot divide by zero");
            return;
          }
          result = 1 / inputValue;
          break;
        case "π":
          result = Math.PI;
          break;
        case "e":
          result = Math.E;
          break;
        case "±":
          result = -inputValue;
          break;
        case "%":
          result = inputValue / 100;
          break;
        default:
          return;
      }

      const expression = `${func}(${inputValue})`;
      addToHistory(expression, String(result));
      setDisplay(String(result));
      setWaitingForOperand(true);
    } catch (error) {
      showError("Calculation error");
    }
  };

  const handleKeyboardInput = useCallback((event: KeyboardEvent) => {
    const { key } = event;
    
    if (key >= "0" && key <= "9") {
      handleNumberClick(key);
    } else if (key === ".") {
      handleDecimalClick();
    } else if (key === "+" || key === "-") {
      handleOperationClick(key);
    } else if (key === "*") {
      handleOperationClick("×");
    } else if (key === "/") {
      handleOperationClick("÷");
    } else if (key === "Enter" || key === "=") {
      event.preventDefault();
      handleEqualsClick();
    } else if (key === "Escape") {
      handleClearClick();
    } else if (key === "Backspace") {
      handleBackspaceClick();
    } else if (key === "^") {
      handleOperationClick("^");
    } else if (key === "p") {
      handleScientificFunction("π");
    } else if (key === "s") {
      handleScientificFunction("sin");
    } else if (key === "c") {
      handleScientificFunction("cos");
    } else if (key === "t") {
      handleScientificFunction("tan");
    }
  }, [display, previousValue, operation, waitingForOperand]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardInput);
    return () => window.removeEventListener("keydown", handleKeyboardInput);
  }, [handleKeyboardInput]);

  const basicButtons = [
    { label: "C", onClick: handleClearClick, className: "bg-red-500 hover:bg-red-600 text-white" },
    { label: "⌫", onClick: handleBackspaceClick, icon: Eraser },
    { label: "%", onClick: () => handleScientificFunction("%") },
    { label: "÷", onClick: () => handleOperationClick("÷"), className: "bg-blue-500 hover:bg-blue-600 text-white" },
    
    { label: "7", onClick: () => handleNumberClick("7") },
    { label: "8", onClick: () => handleNumberClick("8") },
    { label: "9", onClick: () => handleNumberClick("9") },
    { label: "×", onClick: () => handleOperationClick("×"), className: "bg-blue-500 hover:bg-blue-600 text-white" },
    
    { label: "4", onClick: () => handleNumberClick("4") },
    { label: "5", onClick: () => handleNumberClick("5") },
    { label: "6", onClick: () => handleNumberClick("6") },
    { label: "-", onClick: () => handleOperationClick("-"), className: "bg-blue-500 hover:bg-blue-600 text-white" },
    
    { label: "1", onClick: () => handleNumberClick("1") },
    { label: "2", onClick: () => handleNumberClick("2") },
    { label: "3", onClick: () => handleNumberClick("3") },
    { label: "+", onClick: () => handleOperationClick("+"), className: "bg-blue-500 hover:bg-blue-600 text-white" },
    
    { label: "0", onClick: () => handleNumberClick("0"), className: "col-span-2" },
    { label: ".", onClick: handleDecimalClick },
    { label: "=", onClick: handleEqualsClick, className: "bg-green-500 hover:bg-green-600 text-white" },
  ];

  const scientificButtons = [
    { label: "sin", onClick: () => handleScientificFunction("sin") },
    { label: "cos", onClick: () => handleScientificFunction("cos") },
    { label: "tan", onClick: () => handleScientificFunction("tan") },
    { label: "ln", onClick: () => handleScientificFunction("ln") },
    
    { label: "log", onClick: () => handleScientificFunction("log") },
    { label: "√", onClick: () => handleScientificFunction("sqrt") },
    { label: "x²", onClick: () => handleScientificFunction("x²"), icon: Square },
    { label: "^", onClick: () => handleOperationClick("^") },
    
    { label: "π", onClick: () => handleScientificFunction("π"), icon: Pi },
    { label: "e", onClick: () => handleScientificFunction("e") },
    { label: "1/x", onClick: () => handleScientificFunction("1/x") },
    { label: "±", onClick: () => handleScientificFunction("±") },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <Card className="flex-1 p-6 bg-white/90 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalculatorIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Scientific Calculator</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScientific(!isScientific)}
              className={cn(isScientific && "bg-blue-100 border-blue-300")}
            >
              {isScientific ? "Basic" : "Scientific"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className={cn(showHistory && "bg-blue-100 border-blue-300")}
            >
              <History className="w-4 h-4 mr-1" />
              History
            </Button>
          </div>
        </div>

        {/* Display */}
        <div className="mb-4 p-4 bg-gray-900 text-white rounded-lg text-right">
          <div className="text-sm text-gray-400 mb-1 min-h-[20px]">
            {previousValue !== null && operation && `${previousValue} ${operation}`}
          </div>
          <div className="text-2xl font-mono overflow-hidden">
            {display}
          </div>
        </div>

        {/* Scientific Functions */}
        {isScientific && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {scientificButtons<dyad-problem-report summary="1 problems">
<problem file="src/components/Calculator.tsx" line="18" column="3" code="2724">'&quot;lucide-react&quot;' has no exported member named 'SquareRoot'. Did you mean 'SquareDot'?</problem>
</dyad-problem-report><applaa-write path="src/components/Calculator.tsx" description="Fixing lucide-react import by removing non-existent SquareRoot icon">
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  RotateCcw, 
  History, 
  Calculator as CalculatorIcon,
  Square,
  Pi,
  Infinity,
  Percent,
  Eraser
} from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast";

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isScientific, setIsScientific] = useState(true);

  const addToHistory = useCallback((expression: string, result: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: new Date()
    };
    setHistory(prev => [newItem, ...prev.slice(0, 49)]); // Keep last 50 items
  }, []);

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        if (secondValue === 0) {
          showError("Cannot divide by zero");
          return firstValue;
        }
        return firstValue / secondValue;
      case "^":
        return Math.pow(firstValue, secondValue);
      default:
        return secondValue;
    }
  };

  const handleNumberClick = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleDecimalClick = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const handleOperationClick = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const handleEqualsClick = () => {
    if (previousValue !== null && operation) {
      const inputValue = parseFloat(display);
      const newValue = calculate(previousValue, inputValue, operation);
      
      const expression = `${previousValue} ${operation} ${inputValue}`;
      addToHistory(expression, String(newValue));
      
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handleClearClick = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const handleBackspaceClick = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const handleScientificFunction = (func: string) => {
    const inputValue = parseFloat(display);
    let result: number;

    try {
      switch (func) {
        case "sin":
          result = Math.sin(inputValue * Math.PI / 180);
          break;
        case "cos":
          result = Math.cos(inputValue * Math.PI / 180);
          break;
        case "tan":
          result = Math.tan(inputValue * Math.PI / 180);
          break;
        case "log":
          if (inputValue <= 0) {
            showError("Logarithm undefined for non-positive values");
            return;
          }
          result = Math.log10(inputValue);
          break;
        case "ln":
          if (inputValue <= 0) {
            showError("Natural logarithm undefined for non-positive values");
            return;
          }
          result = Math.log(inputValue);
          break;
        case "sqrt":
          if (inputValue < 0) {
            showError("Square root undefined for negative values");
            return;
          }
          result = Math.sqrt(inputValue);
          break;
        case "x²":
          result = inputValue * inputValue;
          break;
        case "1/x":
          if (inputValue === 0) {
            showError("Cannot divide by zero");
            return;
          }
          result = 1 / inputValue;
          break;
        case "π":
          result = Math.PI;
          break;
        case "e":
          result = Math.E;
          break;
        case "±":
          result = -inputValue;
          break;
        case "%":
          result = inputValue / 100;
          break;
        default:
          return;
      }

      const expression = `${func}(${inputValue})`;
      addToHistory(expression, String(result));
      setDisplay(String(result));
      setWaitingForOperand(true);
    } catch (error) {
      showError("Calculation error");
    }
  };

  const handleKeyboardInput = useCallback((event: KeyboardEvent) => {
    const { key } = event;
    
    if (key >= "0" && key <= "9") {
      handleNumberClick(key);
    } else if (key === ".") {
      handleDecimalClick();
    } else if (key === "+" || key === "-") {
      handleOperationClick(key);
    } else if (key === "*") {
      handleOperationClick("×");
    } else if (key === "/") {
      handleOperationClick("÷");
    } else if (key === "Enter" || key === "=") {
      event.preventDefault();
      handleEqualsClick();
    } else if (key === "Escape") {
      handleClearClick();
    } else if (key === "Backspace") {
      handleBackspaceClick();
    } else if (key === "^") {
      handleOperationClick("^");
    } else if (key === "p") {
      handleScientificFunction("π");
    } else if (key === "s") {
      handleScientificFunction("sin");
    } else if (key === "c") {
      handleScientificFunction("cos");
    } else if (key === "t") {
      handleScientificFunction("tan");
    }
  }, [display, previousValue, operation, waitingForOperand]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardInput);
    return () => window.removeEventListener("keydown", handleKeyboardInput);
  }, [handleKeyboardInput]);

  const basicButtons = [
    { label: "C", onClick: handleClearClick, className: "bg-red-500 hover:bg-red-600 text-white" },
    { label: "⌫", onClick: handleBackspaceClick, icon: Eraser },
    { label: "%", onClick: () => handleScientificFunction("%") },
    { label: "÷", onClick: () => handleOperationClick("÷"), className: "bg-blue-500 hover:bg-blue-600 text-white" },
    
    { label: "7", onClick: () => handleNumberClick("7") },
    { label: "8", onClick: () => handleNumberClick("8") },
    { label: "9", onClick: () => handleNumberClick("9") },
    { label: "×", onClick: () => handleOperationClick("×"), className: "bg-blue-500 hover:bg-blue-600 text-white" },
    
    { label: "4", onClick: () => handleNumberClick("4") },
    { label: "5", onClick: () => handleNumberClick("5") },
    { label: "6", onClick: () => handleNumberClick("6") },
    { label: "-", onClick: () => handleOperationClick("-"), className: "bg-blue-500 hover:bg-blue-600 text-white" },
    
    { label: "1", onClick: () => handleNumberClick("1") },
    { label: "2", onClick: () => handleNumberClick("2") },
    { label: "3", onClick: () => handleNumberClick("3") },
    { label: "+", onClick: () => handleOperationClick("+"), className: "bg-blue-500 hover:bg-blue-600 text-white" },
    
    { label: "0", onClick: () => handleNumberClick("0"), className: "col-span-2" },
    { label: ".", onClick: handleDecimalClick },
    { label: "=", onClick: handleEqualsClick, className: "bg-green-500 hover:bg-green-600 text-white" },
  ];

  const scientificButtons = [
    { label: "sin", onClick: () => handleScientificFunction("sin") },
    { label: "cos", onClick: () => handleScientificFunction("cos") },
    { label: "tan", onClick: () => handleScientificFunction("tan") },
    { label: "ln", onClick: () => handleScientificFunction("ln") },
    
    { label: "log", onClick: () => handleScientificFunction("log") },
    { label: "√", onClick: () => handleScientificFunction("sqrt") },
    { label: "x²", onClick: () => handleScientificFunction("x²"), icon: Square },
    { label: "^", onClick: () => handleOperationClick("^") },
    
    { label: "π", onClick: () => handleScientificFunction("π"), icon: Pi },
    { label: "e", onClick: () => handleScientificFunction("e") },
    { label: "1/x", onClick: () => handleScientificFunction("1/x") },
    { label: "±", onClick: () => handleScientificFunction("±") },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <Card className="flex-1 p-6 bg-white/90 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalculatorIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Scientific Calculator</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsScientific(!isScientific)}
              className={cn(isScientific && "bg-blue-100 border-blue-300")}
            >
              {isScientific ? "Basic" : "Scientific"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className={cn(showHistory && "bg-blue-100 border-blue-300")}
            >
              <History className="w-4 h-4 mr-1" />
              History
            </Button>
          </div>
        </div>

        {/* Display */}
        <div className="mb-4 p-4 bg-gray-900 text-white rounded-lg text-right">
          <div className="text-sm text-gray-400 mb-1 min-h-[20px]">
            {previousValue !== null && operation && `${previousValue} ${operation}`}
          </div>
          <div className="text-2xl font-mono overflow-hidden">
            {display}
          </div>
        </div>

        {/* Scientific Functions */}
        {isScientific && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {scientificButtons.map((btn, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={btn.onClick}
                className="h-12 font-medium"
              >
                {btn.icon ? <btn.icon className="w-4 h-4" /> : btn.label}
              </Button>
            ))}
          </div>
        )}

        {/* Basic Functions */}
        <div className="grid grid-cols-4 gap-2">
          {basicButtons.map((btn, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={btn.onClick}
              className={cn(
                "h-12 font-medium",
                btn.className,
                btn.label === "0" && "col-span-2"
              )}
            >
              {btn.icon ? <btn.icon className="w-4 h-4" /> : btn.label}
            </Button>
          ))}
        </div>

        {/* Keyboard shortcuts info */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Keyboard shortcuts: Numbers, +, -, *, /, Enter, Esc, Backspace
        </div>
      </Card>

      {/* History Panel */}
      {showHistory && (
        <Card className="w-full lg:w-80 p-6 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Calculation History</h3>
            <Badge variant="secondary">{history.length} items</Badge>
          </div>
          
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No calculations yet</p>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {history.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-mono text-gray-700">
                      {item.expression}
                    </div>
                    <div className="text-lg font-mono text-blue-600 font-semibold">
                      = {item.result}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => setHistory([])}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear History
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};