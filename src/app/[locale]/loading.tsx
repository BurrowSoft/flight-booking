import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Image
        src="/mascot.svg"
        alt="Loading..."
        width={72}
        height={72}
        className="animate-pulse"
        priority
      />
    </div>
  );
}
