import type { TreeBranchItem, TreeItem, TreeLeafItem } from "./tree.ts";

/**
 * Interface for rendering tree items into string representations.
 * Implementations should convert a flat array of TreeItem objects
 * into an array of formatted strings suitable for display.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { type Renderer } from "./renderer.ts";
 * import { type TreeItem } from "./tree.ts";
 *
 * class SimpleRenderer implements Renderer {
 *   render(items: readonly TreeItem[]): string[] {
 *     return items.map(item => item.label);
 *   }
 * }
 *
 * const renderer = new SimpleRenderer();
 * const items: TreeItem[] = [
 *   { label: "Root", value: "root", path: [], type: "branch", collapsed: false },
 *   { label: "File", value: "file", path: ["root"], type: "leaf" }
 * ];
 *
 * const result = renderer.render(items);
 * assertEquals(result, ["Root", "File"]);
 * ```
 */
export interface Renderer {
  render(items: readonly TreeItem[]): string[];
}

/**
 * Configuration options for DefaultRenderer.
 * All options are optional and will use sensible defaults if not provided.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { DefaultRenderer, type DefaultRendererOptions } from "./renderer.ts";
 * import { type TreeItem } from "./tree.ts";
 *
 * const options: DefaultRendererOptions = {
 *   depth: (item) => item.path.length,
 *   indent: "  ",
 *   rootSymbol: "🌳 ",
 *   leafSymbol: "📄 ",
 *   branchSymbol: (item) => item.collapsed ? "📁 " : "📂 "
 * };
 *
 * const renderer = new DefaultRenderer(options);
 * const items: TreeItem[] = [
 *   { label: "Project", value: "project", path: [], type: "branch", collapsed: false },
 *   { label: "README.md", value: "readme", path: ["project"], type: "leaf" }
 * ];
 *
 * const result = renderer.render(items);
 * assertEquals(result, ["🌳 Project", "  📄 README.md"]);
 * ```
 */
export type DefaultRendererOptions = {
  /**
   * Function to calculate the indentation depth for an item.
   * @default `(item) => Math.max(0, item.path.length - 1)`
   */
  readonly depth: (item: TreeItem) => number;
  /**
   * String used for each level of indentation.
   * @default `" "` (single space)
   */
  readonly indent: string;
  /**
   * Symbol displayed before root items (depth 0).
   * @default `""` (empty string)
   */
  readonly rootSymbol: string;
  /**
   * Symbol or function returning symbol for leaf items.
   * @default `"|  "`
   */
  readonly leafSymbol: string | ((item: TreeLeafItem) => string);
  /**
   * Symbol or function returning symbol for branch items.
   * @default `(item) => item.collapsed ? "|+ " : "|- "`
   */
  readonly branchSymbol: string | ((item: TreeBranchItem) => string);
};

const defaultOptions: DefaultRendererOptions = {
  depth: (item) => Math.max(0, item.path.length - 1),
  indent: " ",
  rootSymbol: "",
  leafSymbol: "|  ",
  branchSymbol: (item) => item.collapsed ? "|+ " : "|- ",
} as const;

/**
 * Default implementation of the Renderer interface.
 * Renders tree items with customizable symbols and indentation.
 *
 * Features:
 * - Configurable depth calculation for custom indentation logic
 * - Separate symbols for root, leaf, and branch items
 * - Dynamic symbols based on item properties (e.g., collapsed state)
 * - Customizable indentation string
 *
 * @example Basic usage with default options
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { DefaultRenderer } from "./renderer.ts";
 * import { type TreeItem } from "./tree.ts";
 *
 * const renderer = new DefaultRenderer();
 * const items: TreeItem[] = [
 *   { label: "project", value: "project", path: [], type: "branch", collapsed: false },
 *   { label: "src", value: "src", path: ["project"], type: "branch", collapsed: false },
 *   { label: "index.ts", value: "index", path: ["project", "src"], type: "leaf" },
 *   { label: "utils", value: "utils", path: ["project", "src"], type: "branch", collapsed: true }
 * ];
 *
 * const result = renderer.render(items);
 * assertEquals(result, [
 *   "project",
 *   "|- src",
 *   " |  index.ts",
 *   " |+ utils"
 * ]);
 * ```
 *
 * @example Custom symbols for file tree
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { DefaultRenderer } from "./renderer.ts";
 * import { type TreeItem } from "./tree.ts";
 *
 * const renderer = new DefaultRenderer({
 *   leafSymbol: "├── ",
 *   branchSymbol: (item) => item.collapsed ? "├── [+] " : "├── [-] ",
 *   indent: "│   "
 * });
 *
 * const items: TreeItem[] = [
 *   { label: "src", value: "src", path: [], type: "branch", collapsed: false },
 *   { label: "components", value: "comp", path: ["src"], type: "branch", collapsed: false },
 *   { label: "Button.tsx", value: "button", path: ["src", "comp"], type: "leaf" },
 *   { label: "Card.tsx", value: "card", path: ["src", "comp"], type: "leaf" }
 * ];
 *
 * const result = renderer.render(items);
 * assertEquals(result, [
 *   "src",
 *   "├── [-] components",
 *   "│   ├── Button.tsx",
 *   "│   ├── Card.tsx"
 * ]);
 * ```
 *
 * @example Using custom depth function
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { DefaultRenderer } from "./renderer.ts";
 * import { type TreeItem } from "./tree.ts";
 *
 * // Double indentation for nested items
 * const renderer = new DefaultRenderer({
 *   depth: (item) => item.path.length * 2,
 *   indent: " "
 * });
 *
 * const items: TreeItem[] = [
 *   { label: "Root", value: "root", path: [], type: "branch", collapsed: false },
 *   { label: "Child", value: "child", path: ["root"], type: "leaf" },
 *   { label: "Grandchild", value: "grand", path: ["root", "child"], type: "leaf" }
 * ];
 *
 * const result = renderer.render(items);
 * assertEquals(result, [
 *   "Root",
 *   "  |  Child",
 *   "    |  Grandchild"
 * ]);
 * ```
 */
export class DefaultRenderer implements Renderer {
  /**
   * The merged options used by this renderer instance.
   */
  options: DefaultRendererOptions;

  /**
   * Creates a new DefaultRenderer with the specified options.
   *
   * @param options - Partial options to override defaults
   */
  constructor(options: Partial<DefaultRendererOptions> = {}) {
    this.options = { ...defaultOptions, ...options };
  }

  /**
   * Renders an array of tree items into formatted strings.
   * Each item is indented based on its depth and prefixed with
   * an appropriate symbol based on its type and state.
   *
   * @param items - Array of tree items to render
   * @returns Array of formatted strings, one per item
   */
  render(items: readonly TreeItem[]): string[] {
    const result: string[] = [];

    for (const item of items) {
      const isRoot = item.path.length === 0;
      const depth = this.options.depth(item);
      const indent = this.options.indent.repeat(depth);

      let symbol: string;
      if (isRoot) {
        symbol = this.options.rootSymbol;
      } else if (item.type === "leaf") {
        symbol = typeof this.options.leafSymbol === "string"
          ? this.options.leafSymbol
          : this.options.leafSymbol(item);
      } else {
        symbol = typeof this.options.branchSymbol === "string"
          ? this.options.branchSymbol
          : this.options.branchSymbol(item);
      }

      result.push(`${indent}${symbol}${item.label}`);
    }

    return result;
  }
}
