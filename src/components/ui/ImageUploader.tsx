import { useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setError('图片超过 500KB，请先压缩再上传');
      e.target.value = '';
      return;
    }

    setError('');
    setUploading(true);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      if (urlData?.publicUrl) {
        onChange([...images, urlData.publicUrl]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '上传失败，请重试';
      setError(msg);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const url = images[index];
    onChange(images.filter((_, i) => i !== index));

    const path = url.split('/').pop();
    if (path) {
      supabase.storage.from('product-images').remove([path]).then(({ error }) => {
        if (error) console.error('Failed to delete image from storage:', error);
      });
    }
  };

  return (
    <div>
      <div className="flex gap-3 flex-wrap mb-3">
        {images.map((img, i) => (
          <div key={i} className="relative group">
            <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border" />
            <button
              onClick={() => handleRemove(i)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              &times;
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors gap-1"
        >
          {uploading ? (
            <span className="text-xs">上传中...</span>
          ) : (
            <>
              <span className="text-xl leading-none">+</span>
              <span className="text-[9px] leading-none">上传</span>
            </>
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-[10px] text-gray-400 mt-1">支持 jpg/png，单张不超过 500KB</p>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}
