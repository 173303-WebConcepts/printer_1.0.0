"use client";
// ** React Imports
import { Fragment, memo, useCallback, useState } from "react";
import dynamic from "next/dynamic";

// import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// import { Editor } from "react-draft-wysiwyg";
// strictly import the Editor this way for Next.js
// const Editor = dynamic(() => import("react-draft-wysiwyg").then((module) => module.Editor), {
//   ssr: false,
// });

import { emojis, toolsOptions } from "./DefaultData";
import { convertToRaw } from "draft-js";
import { Helper } from "@/utils/Helper";

export const MIN_CART_LIMIT = 30;
export const MAX_CART_LIMIT = 2500;

const ContentEditor = memo(({ descriptionContent, setDescriptionContent, submitCount }: any) => {
  const handleEditorStateChange = useCallback(
    (data: any) => {
      setDescriptionContent(data);
    },
    [setDescriptionContent]
  );

  // Extract plain text and count characters
  const characterCount = Helper.getCharacterCount(descriptionContent);

  return (
    <div>
      <div className="mb-2 flex items-end gap-2">
        <h5>Description</h5>
        <p className="text-primary">(Please change the description content according to your desire.)</p>
      </div>

      {/* <Editor
        editorState={descriptionContent}
        onEditorStateChange={handleEditorStateChange}
        toolbar={{
          options: toolsOptions,
          inline: {
            options: ["bold", "italic", "underline", "strikethrough"],
          },
          emoji: {
            emojis: emojis,
          },
        }}
      /> */}
      {/* Show Character Count */}
      <div className="mt-0.5 flex justify-between">
        {
          <p className="text-error">
            {" "}
            {characterCount < MIN_CART_LIMIT && `Characters length must be greater than ${MIN_CART_LIMIT}.`}
            {characterCount > MAX_CART_LIMIT && `Characters length must not be greater than ${MAX_CART_LIMIT}.`}
          </p>
        }
        <p className="">
          <span className={`${characterCount > MAX_CART_LIMIT ? "text-error" : ""}`}>{characterCount}</span> / {MAX_CART_LIMIT}
        </p>
      </div>
    </div>
  );
});

export default ContentEditor;
