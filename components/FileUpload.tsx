import React, { useCallback } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { FileInput } from '../types';

interface FileUploadProps {
  files: FileInput[];
  setFiles: React.Dispatch<React.SetStateAction<FileInput[]>>;
}

export const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles }) => {

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: Promise<FileInput>[] = Array.from(fileList).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            file,
            base64: reader.result as string,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newFiles).then(processedFiles => {
      setFiles(prev => [...prev, ...processedFiles]);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    processFiles(e.dataTransfer.files);
  }, [setFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-academic-300 rounded-xl p-8 transition-colors hover:border-accent-500 hover:bg-academic-50/50 group text-center cursor-pointer"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf"
          className="hidden"
          onChange={handleFileInput}
        />
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-academic-100 text-academic-500 flex items-center justify-center group-hover:bg-accent-50 group-hover:text-accent-600 transition-colors">
            <Upload size={24} />
          </div>
          <div>
            <p className="font-medium text-academic-700">Click to upload or drag & drop</p>
            <p className="text-sm text-academic-400 mt-1">PDF Research Articles only</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
          {files.map((f, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white border border-academic-200 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <span className="text-sm font-medium text-academic-700 truncate">{f.file.name}</span>
              </div>
              <button
                onClick={() => removeFile(idx)}
                className="p-1 hover:bg-academic-100 rounded-full text-academic-400 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};