import { ExternalLinkIcon } from "lucide-react";

export const ToastLink = ({
  message,
  url,
}: {
  message: string;
  url: string;
}) => {
  return (
    <div className="flex items-center gap-3">
      <span>{message}</span>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="cursor-pointer absolute right-3"
      >
        <ExternalLinkIcon size={14} />
      </a>
    </div>
  );
};
