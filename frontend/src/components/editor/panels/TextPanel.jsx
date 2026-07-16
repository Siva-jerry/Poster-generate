import {
  Heading1,
  Heading2,
  Pilcrow,
  Plus,
  Search,
  Type,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import "./TextPanel.css";

const textPresets = [
  {
    id: "heading",
    title: "Add Heading",
    description:
      "Large bold title",
    icon: Heading1,
    action: "heading",
  },
  {
    id: "subheading",
    title: "Add Sub Heading",
    description:
      "Medium sized subtitle",
    icon: Heading2,
    action: "subheading",
  },
  {
    id: "body",
    title: "Add Body Text",
    description:
      "Paragraph or message",
    icon: Pilcrow,
    action: "body",
  },
];

function TextPanel({
  addHeading,
  addSubHeading,
  addBody,
}) {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    customText,
    setCustomText,
  ] = useState("");

  const [
    textType,
    setTextType,
  ] = useState("heading");

  const filteredPresets =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return textPresets;
      }

      return textPresets.filter(
        (item) =>
          item.title
            .toLowerCase()
            .includes(keyword) ||
          item.description
            .toLowerCase()
            .includes(keyword)
      );
    }, [search]);

  const addPresetText = (
    action
  ) => {
    if (
      action === "heading"
    ) {
      addHeading?.();
      return;
    }

    if (
      action === "subheading"
    ) {
      addSubHeading?.();
      return;
    }

    if (action === "body") {
      addBody?.();
    }
  };

  const addCustomText = () => {
    const value =
      customText.trim();

    if (!value) {
      return;
    }

    const options = {
      text: value,
    };

    if (
      textType === "heading"
    ) {
      addHeading?.(options);
    } else if (
      textType === "subheading"
    ) {
      addSubHeading?.(
        options
      );
    } else {
      addBody?.(options);
    }

    setCustomText("");
  };

  const handleCustomTextKeyDown =
    (event) => {
      if (
        event.key === "Enter" &&
        (event.ctrlKey ||
          event.metaKey)
      ) {
        event.preventDefault();
        addCustomText();
      }
    };

  return (
    <div className="text-panel">
      <div className="text-panel__header">
        <div className="text-panel__icon">
          <Type size={20} />
        </div>

        <div>
          <span>TEXT</span>

          <h2>Add Text</h2>

          <p>
            Add editable headings,
            subtitles and messages to
            your poster.
          </p>
        </div>
      </div>

      <div className="text-panel__composer">
        <div className="text-panel__composer-heading">
          <div>
            <span>
              CUSTOM TEXT
            </span>

            <strong>
              Type your poster text
            </strong>
          </div>

          <Type size={18} />
        </div>

        <textarea
          rows="4"
          value={customText}
          placeholder="Example: Happy Birthday Siva!"
          onChange={(event) =>
            setCustomText(
              event.target.value
            )
          }
          onKeyDown={
            handleCustomTextKeyDown
          }
        />

        <div className="text-panel__type-options">
          <button
            type="button"
            className={
              textType ===
              "heading"
                ? "text-panel__type-option text-panel__type-option--active"
                : "text-panel__type-option"
            }
            onClick={() =>
              setTextType(
                "heading"
              )
            }
          >
            Heading
          </button>

          <button
            type="button"
            className={
              textType ===
              "subheading"
                ? "text-panel__type-option text-panel__type-option--active"
                : "text-panel__type-option"
            }
            onClick={() =>
              setTextType(
                "subheading"
              )
            }
          >
            Subtitle
          </button>

          <button
            type="button"
            className={
              textType === "body"
                ? "text-panel__type-option text-panel__type-option--active"
                : "text-panel__type-option"
            }
            onClick={() =>
              setTextType("body")
            }
          >
            Body
          </button>
        </div>

        <button
          type="button"
          className="text-panel__add-button"
          disabled={
            !customText.trim()
          }
          onClick={
            addCustomText
          }
        >
          <Plus size={17} />

          Add to poster
        </button>

        <small className="text-panel__composer-tip">
          Press Ctrl + Enter to add
          the text quickly.
        </small>
      </div>

      <div className="text-panel__section-title">
        <span>
          QUICK TEXT
        </span>

        <strong>
          Add a text style
        </strong>
      </div>

      <div className="text-panel__search">
        <Search size={17} />

        <input
          type="text"
          placeholder="Search text styles..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />
      </div>

      <div className="text-panel__list">
        {filteredPresets.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <button
                key={item.id}
                type="button"
                className="text-panel__card"
                onClick={() =>
                  addPresetText(
                    item.action
                  )
                }
              >
                <div className="text-panel__card-icon">
                  <Icon
                    size={26}
                  />
                </div>

                <div className="text-panel__card-content">
                  <strong>
                    {item.title}
                  </strong>

                  <small>
                    {
                      item.description
                    }
                  </small>
                </div>

                <Plus
                  className="text-panel__card-plus"
                  size={18}
                />
              </button>
            );
          }
        )}
      </div>

      {filteredPresets.length ===
        0 && (
        <div className="text-panel__empty">
          <Search size={24} />

          <strong>
            No text style found
          </strong>

          <p>
            Try another search term.
          </p>
        </div>
      )}

      <div className="text-panel__footer">
        <strong>Tip</strong>

        <p>
          Type your message above and
          select Add to poster. You
          can also double-click text
          on the canvas to edit it.
        </p>
      </div>
    </div>
  );
}

export default TextPanel;