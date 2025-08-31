
import React from 'react';
import { Example } from '../types';

interface ExamplePickerProps {
    examples: Example[];
    onSelect: (example: Example) => void;
    disabled: boolean;
}

const ExamplePicker: React.FC<ExamplePickerProps> = ({ examples, onSelect, disabled }) => {
    return (
        <div className="mt-8">
            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-base font-semibold leading-6 text-slate-900">
                        Or Try an Example
                    </span>
                </div>
            </div>
            <div className={`mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${disabled ? 'opacity-50' : ''}`}>
                {examples.map((example) => (
                    <button
                        key={example.id}
                        onClick={() => onSelect(example)}
                        disabled={disabled}
                        className="group relative flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:hover:border-slate-200"
                    >
                        <div className="flex items-center gap-2">
                           <div className="h-20 w-14 overflow-hidden rounded-md border border-slate-200">
                             <img src={example.personUrl} alt="Example person" className="h-full w-full object-cover object-center" />
                           </div>
                            <div className="h-20 w-14 overflow-hidden rounded-md border border-slate-200">
                               <img src={example.outfitUrl} alt="Example outfit" className="h-full w-full object-cover object-center" />
                           </div>
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-700 group-hover:text-indigo-600">
                            {example.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ExamplePicker;
