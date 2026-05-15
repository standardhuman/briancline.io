import React from "react";

// Tiny purpose-built markdown renderer for legal documents. Handles the
// subset we use: # / ## / ### headings, **bold**, bullet lists with `-`,
// and paragraphs. Not a general-purpose markdown engine — if you find
// yourself reaching for tables, code blocks, or links beyond bare URLs,
// install react-markdown instead.

function renderInline(text, keyPrefix) {
  // Split on **bold** runs.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-b-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={`${keyPrefix}-t-${i}`}>{part}</React.Fragment>;
  });
}

export default function Markdown({ source }) {
  const lines = source.split("\n");
  const blocks = [];
  let para = [];
  let bullets = [];

  const flushPara = () => {
    if (para.length) {
      const i = blocks.length;
      blocks.push(
        <p key={`p-${i}`} className="mt-3 text-gray-800 leading-relaxed">
          {renderInline(para.join(" "), `p${i}`)}
        </p>,
      );
      para = [];
    }
  };

  const flushBullets = () => {
    if (bullets.length) {
      const i = blocks.length;
      blocks.push(
        <ul key={`ul-${i}`} className="mt-3 list-disc ml-6 space-y-1 text-gray-800">
          {bullets.map((b, j) => (
            <li key={j}>{renderInline(b, `ul${i}-${j}`)}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      flushBullets();
      continue;
    }
    if (line.startsWith("# ")) {
      flushPara();
      flushBullets();
      blocks.push(
        <h1 key={`h1-${blocks.length}`} className="mt-8 text-3xl font-bold text-gray-900">
          {line.slice(2)}
        </h1>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushPara();
      flushBullets();
      blocks.push(
        <h2 key={`h2-${blocks.length}`} className="mt-6 text-xl font-semibold text-gray-900">
          {line.slice(3)}
        </h2>,
      );
      continue;
    }
    if (line.startsWith("### ")) {
      flushPara();
      flushBullets();
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="mt-5 text-lg font-semibold text-gray-900">
          {line.slice(4)}
        </h3>,
      );
      continue;
    }
    if (line.startsWith("- ")) {
      flushPara();
      bullets.push(line.slice(2));
      continue;
    }
    flushBullets();
    para.push(line);
  }
  flushPara();
  flushBullets();

  return <div className="text-base">{blocks}</div>;
}
