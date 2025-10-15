import React from 'react';
import { AlertCircle, CheckCircle, Trash2, XCircle } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning' // warning, danger, success, info
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    warning: {
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
    },
    danger: {
      icon: Trash2,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    info: {
      icon: AlertCircle,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
        {/* Header con icono */}
        <div className={`${config.bgColor} ${config.borderColor} border-b px-6 py-4 rounded-t-xl`}>
          <div className="flex items-center gap-3">
            <div className={`${config.iconColor}`}>
              <Icon size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5">
          <div className="text-gray-700 whitespace-pre-line leading-relaxed">
            {message}
          </div>
        </div>

        {/* Botones */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 ${config.buttonColor} text-white rounded-lg transition font-medium`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
