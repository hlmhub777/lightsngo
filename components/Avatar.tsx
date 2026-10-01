type AvatarProps = {
  url?: string | null;
  name: string;
  size?: number;
  online?: boolean;
};

export default function Avatar({ url, name, size = 32, online }: AvatarProps) {
  const initial = name?.charAt(0).toUpperCase() || "?";
  const dotSize = Math.max(8, Math.round(size * 0.3));

  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-full bg-white/10 font-medium text-paper/80"
          style={{ fontSize: size * 0.45 }}
        >
          {initial}
        </span>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-[#12151a] ${
            online ? "bg-green-500" : "bg-gray-500"
          }`}
          style={{ width: dotSize, height: dotSize }}
        />
      )}
    </span>
  );
}