import { GoogleGenAI, Modality } from "@google/genai";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

const handleApiError = (error: unknown, context: 'generation' | 'upscaling'): Error => {
    const serviceName = context === 'generation' ? 'Virtual Try-On service' : 'Upscaling service';
    console.error(`Gemini API Error (${context}):`, error);

    if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
        return new Error('Network error: Could not connect to the AI service. Please check your internet connection.');
    }

    if (error instanceof Error) {
        const message = error.message.toUpperCase();

        if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
            return new Error(`The AI service is currently busy due to high traffic. Please wait a moment and try again.`);
        }
        if (message.includes('400') || message.includes('INVALID_ARGUMENT')) {
            return new Error('Invalid request. The images may be in an unsupported format (please use JPEG or PNG), corrupted, or too large.');
        }
        if (message.includes('401') || message.includes('403') || message.includes('API KEY')) {
            console.error('Authentication Error: Please verify the API key is valid and has permissions.');
            return new Error(`There is a configuration issue with the ${serviceName}. The operation failed.`);
        }
        if (message.match(/5\d{2}/) || message.includes('UNAVAILABLE') || message.includes('INTERNAL')) {
            return new Error(`The ${serviceName} is temporarily unavailable. Please try again later.`);
        }
        
        return new Error(`An unexpected error occurred with the ${serviceName}. Please try again.`);
    }

    return new Error(`An unknown error occurred while contacting the ${serviceName}.`);
};


const handleFinishReason = (candidate: any, context: 'generation' | 'upscaling'): Error | null => {
    if (!candidate?.finishReason || candidate.finishReason === 'STOP') {
        return null; // No error, successful completion
    }

    const processName = context === 'generation' ? 'Image generation' : 'Upscaling';

    switch (candidate.finishReason) {
        case 'SAFETY':
            return new Error(`${processName} was blocked due to content safety policies. Please use different, appropriate images.`);
        case 'RECITATION':
             return new Error(`${processName} was blocked due to recitation policies. Please try a different request.`);
        case 'MAX_TOKENS':
             return new Error("The request is too large for the model to process. Please try using smaller images.");
        default:
            return new Error(`${processName} failed with an unexpected reason: ${candidate.finishReason}. Please try again.`);
    }
}

export const generateVirtualTryOnImage = async (personFile: File, outfitFile: File): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable is not set.");
    }

    const ai = new GoogleGenAI({ apiKey });
  
    const personImagePart = await fileToGenerativePart(personFile);
    const outfitImagePart = await fileToGenerativePart(outfitFile);

    const prompt = "You are an expert virtual stylist. Your task is to take the clothing item from the second image and realistically place it onto the person in the first image. Preserve the person's original pose, body shape, and the background of the first image as accurately as possible. The final output must be only the resulting image, with no added text or explanations.";

    let response;
    try {
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    personImagePart,
                    outfitImagePart,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
    } catch (error: unknown) {
        throw handleApiError(error, 'generation');
    }

    if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        
        const finishReasonError = handleFinishReason(candidate, 'generation');
        if (finishReasonError) {
            throw finishReasonError;
        }

        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    
    throw new Error("The AI could not generate an image from the provided photos. This can happen if the images are not clear or suitable for the task. Please try again with different images.");
};

export const upscaleImage = async (base64Image: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable is not set.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: 'image/png',
        },
    };

    const prompt = "Upscale this image to a higher resolution. Enhance details and clarity without altering the content, style, or composition. The output must be only the upscaled image.";

    let response;
    try {
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    imagePart,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
    } catch (error: unknown) {
        throw handleApiError(error, 'upscaling');
    }

    if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];

        const finishReasonError = handleFinishReason(candidate, 'upscaling');
        if (finishReasonError) {
            throw finishReasonError;
        }

        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }

    throw new Error("The AI could not upscale the image. The generated image might not be suitable for enhancement.");
};