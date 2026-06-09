import { useRef, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { LocalFont } from '@/hooks/useLocalFonts';

interface FontUploaderProps {
  onUpload: (file: File) => Promise<LocalFont | null>;
  isLoading: boolean;
  error: string | null;
}

export function FontUploader({ onUpload, isLoading, error }: FontUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleFileSelect = async (file: File) => {
    const fileKey = `${file.name}-${file.size}`;
    setUploadProgress((prev) => ({ ...prev, [fileKey]: 0 }));

    const result = await onUpload(file);
    
    setUploadProgress((prev) => {
      const updated = { ...prev };
      delete updated[fileKey];
      return updated;
    });

    if (result) {
      toast.success(`已上傳字型：${result.name}`);
    } else if (error) {
      toast.error(error);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // 逐個上傳多個檔案
      Array.from(files).forEach((file) => {
        handleFileSelect(file);
      });
    }
    // 重置 input，允許重複上傳同一檔案
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      // 逐個上傳拖拽的多個檔案
      Array.from(files).forEach((file) => {
        handleFileSelect(file);
      });
    }
  };

  const isUploading = Object.keys(uploadProgress).length > 0;

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`flex items-center gap-2 border-2 border-dashed rounded-lg px-3 py-2 cursor-pointer transition-colors ${
          isDragging
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".ttf,.otf,.ttc,.woff,.woff2"
          onChange={handleFileInputChange}
          disabled={isLoading || isUploading}
          className="hidden"
        />
        <Upload className="w-4 h-4 flex-shrink-0 text-gray-600" />
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {isUploading ? '上傳中...' : '拖拽或點擊上傳字型'}
        </span>
        <span className="text-xs text-gray-500 truncate">
          支援 TTF / OTF / TTC / WOFF / WOFF2，最大 100MB，可多選
        </span>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-900">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
