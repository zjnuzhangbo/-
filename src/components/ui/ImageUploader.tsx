import { useRef } from 'react';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange([...images, reader.result as string]);
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
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors text-2xl"
        >
          +
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}
