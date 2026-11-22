import type { Metadata } from 'next';
import InfiniteArchive from '@/components/sections/InfiniteArchive';
export const metadata: Metadata = { title: 'Infinite Archive' };
export default function ArchivePage() { return <InfiniteArchive />; }
