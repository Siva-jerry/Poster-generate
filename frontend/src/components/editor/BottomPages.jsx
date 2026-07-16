import {
  Copy,
  Grid2X2,
  Plus,
  Trash2,
} from "lucide-react";

import "./BottomPages.css";

function BottomPages({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
}) {
  return (
    <div className="bottom-pages">
      <div className="bottom-pages__left">
        <button
          type="button"
          title="Grid view"
        >
          <Grid2X2 size={18} />
        </button>

        <span>
          Page {pages.length}
        </span>
      </div>

      <div className="bottom-pages__list">
        {pages.map(
          (page, index) => (
            <button
              key={page.id}
              type="button"
              className={
                activePageId === page.id
                  ? "active"
                  : ""
              }
              onClick={() =>
                onSelectPage(page.id)
              }
            >
              <span className="bottom-pages__thumbnail">
                <strong>
                  {index + 1}
                </strong>
              </span>
            </button>
          )
        )}

        <button
          type="button"
          className="bottom-pages__add"
          onClick={onAddPage}
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="bottom-pages__right">
        <button type="button">
          <Copy size={17} />
        </button>

        <button type="button">
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}

export default BottomPages;