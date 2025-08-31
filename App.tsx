
import React, { useState, useCallback } from 'react';
import { ImageFile, Example } from './types';
import { generateVirtualTryOnImage, upscaleImage } from './services/geminiService';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import Spinner from './components/Spinner';
import Footer from './components/Footer';
import ExamplePicker from './components/ExamplePicker';

// Example image data (Base64 encoded to avoid external fetches and CORS issues)
const examples: Example[] = [
  {
    id: 1,
    description: "Woman & Leather Jacket",
    personUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QAiRXhpZgAASUkqAAgAAAABABIBAwABAAAABgASAAAAAAD/7QAsUGhvdG9zaG9wIDMuMAA4QklNA+0AAAAAABAAYAAAAAEAAQBgAAAAAQAHP/gADMINElFQyBQUk9GSUxFAAEBAAABqGFwcGwCEAAAbW50clJHQiBYWVogB+cADgAVAAQAEgA5YWNzcEFQUEwAAAAAQVBQTAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1hcHBsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARZGVzYwAAAVAAAABiZHNjbQAAAcwAAAScY3BydAAAAgQAAAA4d3RwdAAAAhQAAAAUdHJjIAAAAiAAAAAUY2hhZAAAAiwAAAAsclhZWgAAAmQAAAAUZ1hZWgAAAnQAAAAUYlhZWgAAApAAAAAUclRSQwAAApwAAAAOY2hhdAAAAqwAAAAsZ1RSQwAAApwAAAAOYW5keAAAAswAAAA6Ymx1ZQAAAngAAAAUc2NpZwAAAXgAAAFGY29weQABAowAAAAsbWx1YwAAAAAAAAABAAAADGVuVVMAAAAUAAAAHABIAQwBDACAAVQBuAGkAdgBlAHIAcwBhAGwAAG1sdWMAAAAAAAAAAQAAAAxlblVTAAAAMAAAABwARABpAHMAcABsAGEAeQAgAFAAMwAgAEgAQwBDACAAVQBuAGkAdgBlAHIAcwBhAGwAAAAAWFlaIAAAAAAAAP+EAAC2z///+7UAAAOkAAB10WFlaIAAAAAAAAskAAAORAAAA/8FhZWiAAAAAAAACdAAADDAAAAM5zY2lnAAAAAAAAAAEAQUpCAAAAAAAAAAAAAAAAAAAA//4AFL/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAgACADASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAQIDBf/EAB4QAQEAAwEAAwEBAAAAAAAAAAECERIDITFBUWFA/QAFgEBAQEAAAAAAAAAAAAAAAAAAQID/8QAFhEBAQEAAAAAAAAAAAAAAAAAABEB/9oADAMBAAIRAxEAPwC652SyybJ2vMct2Rnbh7JrySdv2V4m95l/1T12Sze3yX2X5k/M/VTc5ZeyTcnJe5+C8L5/M28vJb3+LcP2Xg/LFx8t+v8AXD8zV5N+h9LzeS+z7JtyVvT5J78Pmv1cvn5e3u/1Xl/LzPcvD+WFy8fKfX+lXw/JX/Z//9k=',
    outfitUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QAiRXhpZgAASUkqAAgAAAABABIBAwABAAAABgASAAAAAAD/7QAsUGhvdG9zaG9wIDMuMAA4QklNA+0AAAAAABAAYAAAAAEAAQBgAAAAAQAHP/gADMINElFQyBQUk9GSUxFAAEBAAABqGFwcGwCEAAAbW50clJHQiBYWVogB+cADgAVAAQAEgA5YWNzcEFQUEwAAAAAQVBQTAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1hcHBsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARZGVzYwAAAVAAAABiZHNjbQAAAcwAAAScY3BydAAAAgQAAAA4d3RwdAAAAhQAAAAUdHJjIAAAAiAAAAAUY2hhZAAAAiwAAAAsclhZWgAAAmQAAAAUZ1hZWgAAAnQAAAAUYlhZWgAAApAAAAAUclRSQwAAApwAAAAOY2hhdAAAAqwAAAAsZ1RSQwAAApwAAAAOYW5keAAAAswAAAA6Ymx1ZQAAAngAAAAUc2NpZwAAAXgAAAFGY29weQABAowAAAAsbWx1YwAAAAAAAAABAAAADGVuVVMAAAAUAAAAHABIAQwBDACAAVQBuAGkAdgBlAHIAcwBhAGwAAG1sdWMAAAAAAAAAAQAAAAxlblVTAAAAMAAAABwARABpAHMAcABsAGEAeQAgAFAAMwAgAEgAQwBDACAAVQBuAGkAdgBlAHIAcwBhAGwAAAAAWFlaIAAAAAAAAP+EAAC2z///+7UAAAOkAAB10WFlaIAAAAAAAAskAAAORAAAA/8FhZWiAAAAAAAACdAAADDAAAAM5zY2lnAAAAAAAAAAEAQUpCAAAAAAAAAAAAAAAAAAAA//4AFL/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAgACADASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAECBQP/xAAeEAEAAgICAwEAAAAAAAAAAAAAAQIDERISITFRcf/EABUBAQEAAAAAAAAAAAAAAAAAAAEA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A1PivbL83nL6r7eKy7MvPHz5r149s+MvP5Hk/a/wDprV4c87Znl5v83xS5Xl5Me3yPl/lP0f8AzXnx8V29V6tXm+N878L52+V7Z+a9uPz/ADvV+O3n2S838a8s/T+qH4/i+P5HyvP1f2vX/NP08n28353l8l5/VfV+U8F7/S/9k=',
  },
  {
    id: 2,
    description: "Man & Denim Shirt",
    personUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QAiRXhpZgAASUkqAAgAAAABABIBAwABAAAABgASAAAAAAD/7QAsUGhvdG9zaG9wIDMuMAA4QklNA+0AAAAAABAAYAAAAAEAAQBgAAAAAQAHP/gADMINElFQyBQUk9GSUxFAAEBAAABqGFwcGwCEAAAbW50clJHQiBYWVogB+cADgAVAAQAEgA5YWNzcEFQUEwAAAAAQVBQTAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1hcHBsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARZGVzYwAAAVAAAABiZHNjbQAAAcwAAAScY3BydAAAAgQAAAA4d3RwdAAAAhQAAAAUdHJjIAAAAiAAAAAUY2hhZAAAAiwAAAAsclhZWgAAAmQAAAAUZ1hZWgAAAnQAAAAUYlhZWgAAApAAAAAUclRSQwAAApwAAAAOY2hhdAAAAqwAAAAsZ1RSQwAAApwAAAAOYW5keAAAAswAAAA6Ymx1ZQAAAngAAAAUc2NpZwAAAXgAAAFGY29weQABAowAAAAsbWx1YwAAAAAAAAABAAAADGVuVVMAAAAUAAAAHABIAQwBDACAAVQBuAGkAdgBlAHIAcwBhAGwAAG1sdWMAAAAAAAAAAQAAAAxlblVTAAAAMAAAABwARABpAHMAcABsAGEAeQAgAFAAMwAgAEgAQwBDACAAVQBuAGkAdgBlAHIAcwBhAGwAAAAAWFlaIAAAAAAAAP+EAAC2z///+7UAAAOkAAB10WFlaIAAAAAAAAskAAAORAAAA/8FhZWiAAAAAAAACdAAADDAAAAM5zY2lnAAAAAAAAAAEAQUpCAAAAAAAAAAAAAAAAAAAA//4AFL/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAgACADASIAAhEBAxEB/8QAGwAAAgIDAQAAAAAAAAAAAAAAAAECAwQFBwb/xAAjEAACAgEEAgMBAQAAAAAAAAAAAQIDERIxBAUhQRMyUWFx/QAFgEBAQEAAAAAAAAAAAAAAAAAAQIA/8QAFxEBAQEBAAAAAAAAAAAAAAAAAAERAf/aAAwDAQACEQMRAD8A0zDk+S8+F9E13i+r+H/AAT17fLg8n5v5t2yJ69y25a909x6zD4fweU7Hl911xT877L/AJe3s9N5Gf8AyXlfM+dCj4+N/U7e+/VdOvfP+L5/1n3/AIXnj48fS6+1/wBv4M23xIqU3lWf07/T+X3U2217k21yY1fB08vD4eRj+h4/7Y8Xj11x/pv2X/c+/d+a1LzZOP5fyeVX+p179d67Xpny//9k=',
    outfitUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QAiRXhpZgAASUkqAAgAAAABABIBAwABAAAABgASAAAAAAD/7QAsUGhvdG9zaG9wIDMuMAA4QklNA+0AAAAAABAAYAAAAAEAAQBgAAAAAQAHP/gADMINElFQyBQUk9GSUxFAAEBAAABqGFwcGwCEAAAbW50clJHQiBYWVogB+cADgAVAAQAEgA5YWNzcEFQUEwAAAAAQVBQTAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1hcHBsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARZGVzYwAAAVAAAABiZHNjbQAAAcwAAAScY3BydAAAAgQAAAA4d3RwdAAAAhQAAAAUdHJjIAAAAiAAAAAUY2hhZAAAAiwAAAAsclhZWgAAAmQAAAAUZ1hZWgAAAnQAAAAUYlhZWgAAApAAAAAUclRSQwAAApwAAAAOY2hhdAAAAqwAAAAsZ1RSQwAAApwAAAAOYW5keAAAAswAAAA6Ymx1ZQAAAngAAAAUc2NpZwAAAXgAAAFGY29weQABAowAAAAsbWx1YwAAAAAAAAABAAAADGVuVVMAAAAUAAAAHABIAQwBDACAAVQBuAGkAdgBlAHIAcwBhAGwAAG1sdWMAAAAAAAAAAQAAAAxlblVTAAAAMAAAABwARABpAHMAcABsAGEAeQAgAFAAMwAgAEgAQwBDACAAVQBuAGkAdgBlAHIAcwBhAGwAAAAAWFlaIAAAAAAAAP+EAAC2z///+7UAAAOkAAB10WFlaIAAAAAAAAskAAAORAAAA/8FhZWiAAAAAAAACdAAADDAAAAM5zY2lnAAAAAAAAAAEAQUpCAAAAAAAAAAAAAAAAAAAA//4AFL/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAgACADASIAAhEBAxEB/8QAGwAAAQUBAQAAAAAAAAAAAAAAAAECBAUGAwf/xAAfEAACAQQCAwEAAAAAAAAAAAAAAQIDERIEITEFBhNRYXH/xAAXAQEBAQEAAAAAAAAAAAAAAAAAAQID/8QAFhEBAQEAAAAAAAAAAAAAAAAAABEB/9oADAMBAAIRAxEAPwDaXyIu8zL8fX+U26487WjG9k27+k9nrzH5fPef5s43n236m19a6/m9V5PznhxnjvNrrO/wD7Hh7K+NfL+F7L3RjG837a/wBta1V1U8qG/wBPpY8l67/x8P4Hl+ZqfL8uM/T3X7X0fTXn/lPL+f1+L+Vb+b+30/62u+N/H/8AfU//2Q==',
  },
];

const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(',');
  // The first part of the array is the mime type header
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error('Invalid data URI');
  }
  const mime = mimeMatch[1];
  // The second part is the base64-encoded data
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<ImageFile | null>(null);
  const [outfitImage, setOutfitImage] = useState<ImageFile | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpscaling, setIsUpscaling] = useState<boolean>(false);
  const [isUpscaled, setIsUpscaled] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePersonImageSelect = (file: File) => {
    setPersonImage({ file, previewUrl: URL.createObjectURL(file) });
  };

  const handleOutfitImageSelect = (file: File) => {
    setOutfitImage({ file, previewUrl: URL.createObjectURL(file) });
  };

  const handleTryOn = useCallback(async () => {
    if (!personImage || !outfitImage) {
      setError("Please upload both a person and an outfit image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setIsUpscaled(false);

    try {
      const resultImageBase64 = await generateVirtualTryOnImage(personImage.file, outfitImage.file);
      setGeneratedImage(`data:image/png;base64,${resultImageBase64}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [personImage, outfitImage]);
  
  const handleUpscale = useCallback(async () => {
    if (!generatedImage) return;

    setIsUpscaling(true);
    setError(null);

    try {
      const base64Data = generatedImage.split(',')[1];
      const upscaledBase64 = await upscaleImage(base64Data);
      setGeneratedImage(`data:image/png;base64,${upscaledBase64}`);
      setIsUpscaled(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during upscaling.");
    } finally {
      setIsUpscaling(false);
    }
  }, [generatedImage]);

  const handleReset = () => {
    setPersonImage(null);
    setOutfitImage(null);
    setGeneratedImage(null);
    setError(null);
    setIsLoading(false);
    setIsUpscaling(false);
    setIsUpscaled(false);
  };
  
  const handleDownload = useCallback(() => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `virtual-try-on-result${isUpscaled ? '-hd' : ''}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage, isUpscaled]);
  
  const handleExampleSelect = useCallback((example: Example) => {
    handleReset();
    setIsLoading(true); // Provide feedback that examples are loading
    try {
      const personFile = dataUrlToFile(example.personUrl, `example-person-${example.id}.jpg`);
      const outfitFile = dataUrlToFile(example.outfitUrl, `example-outfit-${example.id}.jpg`);

      setPersonImage({ file: personFile, previewUrl: URL.createObjectURL(personFile) });
      setOutfitImage({ file: outfitFile, previewUrl: URL.createObjectURL(outfitFile) });
    } catch (err) {
        console.error("Failed to load example images:", err);
        setError("Could not load the example images. The data might be corrupted. Please try another example.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  const canTryOn = personImage && outfitImage && !isLoading;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <div className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <main className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10">
          <Header />
          <ExamplePicker examples={examples} onSelect={handleExampleSelect} disabled={isLoading} />
          <div className="mt-8 grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Left Column: Inputs */}
            <div className="flex flex-col gap-8">
              <ImageUploader
                id="person-uploader"
                title="Upload Your Photo"
                description="Upload a clear, full-body photo of yourself."
                onImageSelect={handlePersonImageSelect}
                imagePreviewUrl={personImage?.previewUrl ?? null}
              />
              <ImageUploader
                id="outfit-uploader"
                title="Upload Outfit Photo"
                description="Upload a photo of the clothing item."
                onImageSelect={handleOutfitImageSelect}
                imagePreviewUrl={outfitImage?.previewUrl ?? null}
              />
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button
                  onClick={handleTryOn}
                  disabled={!canTryOn}
                  className="w-full flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Generating...' : 'Virtual Try-On'}
                </button>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>

            {/* Right Column: Output */}
            <div className="flex flex-col justify-center items-center bg-slate-100 rounded-lg p-6 h-96 md:h-full min-h-[24rem]">
              {isLoading && <Spinner />}
              {error && !isLoading && (
                 <div className="text-center text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-semibold">Operation Failed</p>
                    <p className="text-sm">{error}</p>
                 </div>
              )}
               {!isLoading && !generatedImage && !error && (
                <div className="text-center text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-medium">Your Result Will Appear Here</h3>
                    <p className="text-sm">Upload your photos and click "Virtual Try-On" to begin.</p>
                </div>
              )}
              {generatedImage && !isLoading && !error && (
                <div className="flex flex-col items-center justify-between gap-4 w-full h-full">
                  <div className="w-full flex-grow min-h-0 flex items-center justify-center">
                    <img src={generatedImage} alt="Virtual try-on result" className="max-w-full max-h-full object-contain rounded-md shadow-md"/>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                    <button
                      onClick={handleDownload}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      aria-label="Download generated image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download {isUpscaled ? 'HD' : ''}
                    </button>
                    {!isUpscaled && (
                      <button
                        onClick={handleUpscale}
                        disabled={isUpscaling}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-slate-700 bg-slate-200 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                        aria-label="Upscale generated image"
                      >
                        {isUpscaling ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Upscaling...
                          </>
                        ) : (
                          'Upscale ✨'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default App;
