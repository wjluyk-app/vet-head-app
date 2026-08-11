"use client";

type ConfirmClearScoreButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  label: string;
  message: string;
};

export default function ConfirmClearScoreButton({
  action,
  label,
  message,
}: ConfirmClearScoreButtonProps) {
  return (
    <button
      type="submit"
      className="vetClearScoreButton"
      formAction={action}
      formNoValidate
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
