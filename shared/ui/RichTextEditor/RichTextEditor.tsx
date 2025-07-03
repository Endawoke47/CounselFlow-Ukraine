import { FC } from 'react';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css';
import './style.css';
import Label from '@/shared/ui/Label';

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }], // H1, H2
    ['bold', 'italic', 'underline', 'strike'], // Text formatting
    [{ align: [] }], // Alignment
    ['blockquote', 'link'], // Blockquote & Links
    [{ list: 'ordered' }, { list: 'bullet' }], // Lists
    ['clean'], // Remove Formatting
  ],
};

interface RichTextEditorProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
}

const RichTextEditor: FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  required,
}) => {
  return (
    <div>
      {label && (
        <Label
          className="text-sm text-slate-800 block mb-2"
          required={required}
        >
          {label}
        </Label>
      )}
      <div className="border border-divider-light-grey rounded-[10px]">
        <ReactQuill
          value={value}
          onChange={onChange}
          modules={modules}
          className="bg-white rounded-[10px] h-[150px]"
          placeholder="Type your description here..."
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
