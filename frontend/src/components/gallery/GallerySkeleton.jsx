import "./GallerySkeleton.css";

function GallerySkeleton({
  count = 8,
}) {
  return (
    <div className="gallery-skeleton">
      {Array.from({
        length: count,
      }).map((_, index) => (
        <article
          key={index}
          className="gallery-skeleton__card"
        >
          <div className="gallery-skeleton__image" />

          <div className="gallery-skeleton__content">
            <span />
            <span />
          </div>
        </article>
      ))}
    </div>
  );
}

export default GallerySkeleton;