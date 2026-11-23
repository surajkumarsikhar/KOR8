/** One persistent brand object; its destination is measured, never reparented. */
export default function SharedBrandMark() {
  return <>
    <div data-brand-source className="brand-mark-source" aria-hidden="true" />
    <div data-shared-brand className="shared-brand-mark" aria-hidden="true"><img src="/images/brand-symbol.svg" alt="" /></div>
  </>;
}
