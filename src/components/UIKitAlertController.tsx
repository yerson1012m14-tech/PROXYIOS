import React, { useState } from 'react';

export interface UIAlertAction {
  title: string;
  style?: 'default' | 'cancel' | 'destructive';
  handler?: () => void;
  icon?: React.ReactNode;
}

export interface UIAlertControllerProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  preferredStyle: 'actionSheet' | 'alert';
  actions: UIAlertAction[];
  textFields?: Array<{
    placeholder?: string;
    defaultValue?: string;
    fontMonospace?: boolean;
    autoCapitalize?: 'none' | 'characters' | 'words';
    onChange?: (val: string) => void;
  }>;
  onDismiss: () => void;
}

export const UIKitAlertController: React.FC<UIAlertControllerProps> = ({
  isOpen,
  title,
  message,
  preferredStyle,
  actions,
  textFields = [],
  onDismiss
}) => {
  const [fieldValues, setFieldValues] = useState<string[]>(
    textFields.map((tf) => tf.defaultValue || '')
  );

  if (!isOpen) return null;

  // Separate cancel action from other actions in action sheet
  const cancelAction = actions.find((a) => a.style === 'cancel');
  const regularActions = actions.filter((a) => a.style !== 'cancel');

  if (preferredStyle === 'actionSheet') {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-[390px] flex flex-col gap-2 animate-in slide-in-from-bottom duration-250 ease-out">
          {/* Main Action Group Container (iOS 18 Frosted Glass Card) */}
          <div className="w-full bg-[#252528]/90 backdrop-blur-3xl rounded-[14px] overflow-hidden border border-white/10 shadow-2xl divide-y divide-[#38383A]/60">
            {/* Header (Title & Message) */}
            {(title || message) && (
              <div className="px-4 py-3.5 text-center">
                {title && (
                  <h3 className="text-[13px] font-semibold text-[#8E8E93] tracking-[-0.2px]">
                    {title}
                  </h3>
                )}
                {message && (
                  <p className="text-[13px] text-[#8E8E93] mt-1 whitespace-pre-line leading-relaxed">
                    {message}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons (iOS 18 Action Sheet Rows) */}
            {regularActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  action.handler?.();
                  onDismiss();
                }}
                className={`w-full py-3.5 px-4 text-center text-[18px] transition-colors flex items-center justify-center gap-2 active:bg-[#3A3A3C]/60 ${
                  action.style === 'destructive'
                    ? 'text-[#FF453A] font-normal'
                    : 'text-[#30D158] font-normal'
                }`}
              >
                {action.icon}
                <span>{action.title}</span>
              </button>
            ))}
          </div>

          {/* Separate Floating Cancel Pill */}
          {cancelAction && (
            <button
              onClick={() => {
                cancelAction.handler?.();
                onDismiss();
              }}
              className="w-full py-3.5 bg-[#252528]/95 backdrop-blur-3xl text-center text-[18px] font-semibold text-[#30D158] rounded-[14px] active:bg-[#3A3A3C] transition-colors shadow-lg border border-white/10"
            >
              {cancelAction.title}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Alert Modal Dialog Style (UIAlertControllerStyleAlert)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[280px] bg-[#252528]/95 backdrop-blur-3xl rounded-[14px] overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Title and Message */}
        <div className="p-4 text-center">
          {title && (
            <h3 className="text-[17px] font-semibold text-white tracking-[-0.4px]">
              {title}
            </h3>
          )}
          {message && (
            <p className="text-[13px] text-[#D1D1D6] mt-1 leading-snug whitespace-pre-line">
              {message}
            </p>
          )}

          {/* Optional TextFields (iOS Alert Style) */}
          {textFields.length > 0 && (
            <div className="mt-3.5 space-y-2">
              {textFields.map((tf, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={tf.placeholder}
                  value={fieldValues[i]}
                  onChange={(e) => {
                    const newVals = [...fieldValues];
                    newVals[i] = e.target.value;
                    setFieldValues(newVals);
                    tf.onChange?.(e.target.value);
                  }}
                  className={`w-full px-3 py-1.5 text-[14px] bg-[#1C1C1E] border border-[#38383A] rounded-[8px] text-white placeholder:text-[#8E8E93] focus:outline-none focus:border-[#30D158] ${
                    tf.fontMonospace ? 'font-mono' : ''
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Action Buttons Row or Column */}
        <div
          className={`border-t border-[#38383A]/60 ${
            actions.length === 2 ? 'grid grid-cols-2 divide-x divide-[#38383A]/60' : 'divide-y divide-[#38383A]/60'
          }`}
        >
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                action.handler?.();
                onDismiss();
              }}
              className={`w-full py-3 text-center text-[17px] transition-colors active:bg-[#3A3A3C]/50 ${
                action.style === 'cancel'
                  ? 'font-normal text-[#30D158]'
                  : action.style === 'destructive'
                  ? 'font-semibold text-[#FF453A]'
                  : 'font-semibold text-[#30D158]'
              }`}
            >
              {action.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
