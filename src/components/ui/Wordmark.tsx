import Image from 'next/image';
import { BRAND } from '@/content/cinematic';
import { cn } from '@/lib/utils';

export default function Wordmark({ className }: { className?: string }) {
  return <Image src={BRAND.wordmark} alt="KOR8" width={462} height={111} className={cn('brand-wordmark', className)} />;
}
