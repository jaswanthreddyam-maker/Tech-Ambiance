// @ts-nocheck
import { renderAsync } from "@react-email/render";
import React from "react";

export class EmailTemplateRenderer {
  /**
   * Renders a React component to an HTML string asynchronously.
   * @param component The React Email component to render
   * @returns HTML string
   */
  static async renderHtml(component: React.ReactElement): Promise<string> {
    return await renderAsync(component);
  }
}
