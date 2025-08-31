import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop';

interface ImageUploaderProps {
  id: string;
  title: string;
  description: string;
  onImageSelect: (file: File) => void;
  imagePreviewUrl: string | null;
}

// Helper function to create a cropped image file
async function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName: string,
): Promise<File | null> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  if (crop.width === 0 || crop.height === 0) {
    console.error("Crop dimensions are zero. Cannot create an empty canvas.");
    return null;
  }
  
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }
  
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = crop.width * pixelRatio;
  canvas.height = crop.height * pixelRatio;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }
      const croppedFile = new File([blob], fileName, { type: blob.type });
      resolve(croppedFile);
    }, 'image/png', 1);
  });
}

const aspectRatios = [
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
    { label: 'Free', value: undefined },
];

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, description, onImageSelect, imagePreviewUrl }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [aspect, setAspect] = useState<number | undefined>(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setOriginalFile(file);
      setCrop(undefined) // Reset crop when new image is selected
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setOriginalFile(file);
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(file);
    }
  };

  const openFileDialog = useCallback(() => {
    setImgSrc('');
    setCompletedCrop(undefined);
    setOriginalFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
    }
    fileInputRef.current?.click();
  }, []);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect || width / height,
        width,
        height,
      ),
      width,
      height,
    );
    setCrop(newCrop);
    // Fix for type error on line 154: Removed call to `setCompletedCrop`.
    // This was causing a type mismatch. The `onComplete` handler is the correct
    // place to update the completed crop state after initialization.
  }

  const handleCrop = async () => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current && originalFile) {
        const croppedFile = await getCroppedImg(imgRef.current, completedCrop, originalFile.name);
        if (croppedFile) {
            onImageSelect(croppedFile);
            setImgSrc(''); // Hide cropper
        }
    } else {
        console.error("Cannot crop: Missing completed crop data, image reference, or original file.");
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-slate-900">{title}</h3>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm font-medium text-slate-600">Aspect Ratio:</span>
        <div className="flex gap-1 rounded-md bg-slate-100 p-1">
          {aspectRatios.map(ratio => (
            <button
              key={ratio.label}
              onClick={() => setAspect(ratio.value)}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${aspect === ratio.value ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'}`}
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>
      <input
        type="file"
        id={id}
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        aria-hidden="true"
      />
      
      <div className="mt-2">
        {imgSrc && (
          <div className="flex flex-col items-center gap-4">
            <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                className="max-h-[400px]"
            >
                <img ref={imgRef} alt="Crop preview" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '400px' }} />
            </ReactCrop>
            <button
              onClick={handleCrop}
              disabled={!completedCrop?.width || !completedCrop?.height}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400"
            >
              Crop & Use Image
            </button>
          </div>
        )}
        {!imgSrc && imagePreviewUrl && (
          <div className="relative group w-full h-48">
            <img src={imagePreviewUrl} alt="Selected preview" className="w-full h-full object-contain rounded-md" />
            <div 
                onClick={openFileDialog} 
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity duration-300 cursor-pointer rounded-md"
            >
                <span className="text-white opacity-0 group-hover:opacity-100 font-medium">Change Image</span>
            </div>
          </div>
        )}
        {!imgSrc && !imagePreviewUrl && (
          <div
            onClick={openFileDialog}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex justify-center items-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md cursor-pointer transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'hover:border-slate-400'}`}
          >
            <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-slate-600">
                <span className="relative font-medium text-indigo-600 hover:text-indigo-500">
                    Upload a file
                </span>
                <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;