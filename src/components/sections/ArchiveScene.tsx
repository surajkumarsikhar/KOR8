import InfiniteArchive from './InfiniteArchive';

export default function ArchiveScene() {
  return <section id="universe" data-scene="universe" className="film-scene universe-scene archive-scene" aria-label="Infinite archive">
    <div data-archive-handoff className="archive-handoff"><InfiniteArchive embedded /></div>
  </section>;
}
