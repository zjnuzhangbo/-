import { useRef, useState } from 'react';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setError('图片超过 500KB，请先压缩再上传');
      e.target.value = '';
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const newImages = [...images, reader.result as string];
        onChange(newImages);
        localStorage.setItem('_img_test', reader.result as string);
        localStorage.removeItem('_img_test');
      } catch {
        setError('存储空间不足，请删除旧图片或使用更小的图片');
      }
    };
    reader.onerror = () => {
      setError('图片读取失败，请重试');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div>
      <div className="flex gap-3 flex-wrap mb-3">
        {images.map((img, i) => (
          <div key={i} className="relative group">
            <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border" />
            <button
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              &times;
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors gap-1"
        >
          <span className="text-xl leading-none">+</span>
          <span className="text-[9px] leading-none">上传</span>
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-[10px] text-gray-400 mt-1">支持 jpg/png，单张不超过 500KB</p>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}
