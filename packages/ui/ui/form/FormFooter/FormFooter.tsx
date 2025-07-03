import React from 'react';

import { Button } from '../../Button';

interface FormFooterProps {
  onCancel: () => void;
  onSave: () => void;
  cancelLabel?: string;
  saveLabel?: string;
  isSaving?: boolean;
  formId?: string;
}

const FormFooter: React.FC<FormFooterProps> = ({
  onCancel,
  onSave,
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
  isSaving = false,
  formId,
}) => {
  return (
    <div className="flex justify-end gap-4 mt-6">
      <Button
        type="button"
        size="lg"
        onClick={onCancel}
        className="w-[140px] bg-gray-300 text-black rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        {cancelLabel}
      </Button>
      <Button
        type="submit"
        size="lg"
        form={formId}
        onClick={onSave}
        disabled={isSaving}
        className="w-[140px] bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : saveLabel}
      </Button>
    </div>
  );
};

export default FormFooter;
