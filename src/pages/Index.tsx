"use client";

import { useState, useEffect, useCallback } from "react";
import { Calculator } from "@/components/Calculator";
import { MadeWithApplaa } from "@/components/made-with-applaa";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Scientific Calculator
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Advanced calculations with history and keyboard support
            </p>
          </div>
          <Calculator />
        </div>
      </div>
      <MadeWithApplaa />
    </div>
  );
};

export default Index;