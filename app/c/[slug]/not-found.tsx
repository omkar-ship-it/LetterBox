import Link from "next/link";

export default function CardNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#fbf6ef] px-6 text-center">
      <p className="font-serif text-2xl text-[#2b2117]">This letter isn&apos;t here.</p>
      <p className="max-w-xs text-sm text-[#8a7367]">
        The link might be mistyped, or the letter has already found its way home.
      </p>
      <Link href="/" className="mt-4 text-sm font-semibold underline underline-offset-4">
        Back to LetterMail
      </Link>
    </div>
  );
}
