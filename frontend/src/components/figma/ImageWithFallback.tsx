import { useState } from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement>;

export const ImageWithFallback = ({ src, alt, ...rest }: Props) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-slate-500">
        Image unavailable
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      {...rest}
      onError={() => setError(true)}
    />
  );
};
