import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Image
        src="/mascot.png"
        alt="Loading..."
        width={80}
        height={80}
        className="animate-pulse"
        priority
      />
    </div>
  );
}
