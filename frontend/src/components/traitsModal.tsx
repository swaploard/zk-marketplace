import { useState } from 'react';

interface AddTraitModalProps {
  onClose?: (value: boolean) => void;
  setValue: (name: string, value: Record<string, string>) => void;
  getValues?: (arg: string) => Record<string, string>;
}

export default function AddTraitModal({
  onClose,
  setValue,
  getValues,
}: AddTraitModalProps) {
  const [traits, setTraits] = useState({
    key: '',
    value: '',
  });
  const handleAddTrait = () => {
    if (traits.key && traits.value) {
      const currentAttributes = getValues('additionalAttributes') || {};
      const newAttributes = {
        ...currentAttributes,
        [traits.key]: traits.value,
      };
      setValue('additionalAttributes', newAttributes);
      onClose(false);
    }
  };
  return (
    <div className="fixed w-screen h-screen bg-black/80 flex items-center justify-center z-10 top-0 left-0">
      {/* Modal container */}
      <div className="max-w-lg bg-[#1E1E1E] rounded-lg p-4">
        {/* Close button */}
        <button
          className="absolute top-6 right-6 text-white"
          onClick={() => onClose(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-x"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        {/* Modal header */}
        <h2 className="text-white text-lg font-bold">Add trait</h2>

        {/* Form fields */}
        <div className="flex flex-row flex-nowrap justify-between mt-4 gap-2">
          <div>
            <label htmlFor="type" className="block text-white text-base mb-1">
              Type
            </label>
            <input
              type="text"
              id="type"
              className="w-full bg-[#1E1E1E] border border-gray-600 rounded-[10px] py-2 px-4 text-white text-base"
              placeholder="Ex. Rarity Type"
              onChange={(e) => setTraits({ ...traits, key: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-white text-base mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full bg-[#1E1E1E] border border-gray-600 rounded-[10px] py-2 px-4 text-white text-base"
              placeholder="Ex. Epic"
              onChange={(e) => setTraits({ ...traits, value: e.target.value })}
            />
          </div>
          {/* Edit button */}
        </div>
        <button
          className={`w-full bg-blue-700 hover:bg-[#3b78e7] text-white font-medium py-2 px-4 rounded-[10px] text-xl mt-6 ${!traits.key || !traits.value
            ? 'opacity-50 cursor-not-allowed bg-blue-900'
            : ''
            }`}
          onClick={handleAddTrait}
          disabled={!traits.key || !traits.value}
        >
          Add
        </button>
      </div>
    </div>
  );
}
