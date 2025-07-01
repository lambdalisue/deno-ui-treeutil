import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import type { TreeItem } from "./tree.ts";
import {
  DefaultRenderer,
  type DefaultRendererOptions,
  type Renderer,
} from "./renderer.ts";

describe("DefaultRenderer", () => {
  describe("constructor", () => {
    it("uses default options when no options provided", () => {
      const renderer = new DefaultRenderer();
      assertEquals(renderer.options.indent, " ");
      assertEquals(renderer.options.rootSymbol, "");
      assertEquals(renderer.options.leafSymbol, "|  ");
      assertEquals(typeof renderer.options.branchSymbol, "function");
      assertEquals(typeof renderer.options.depth, "function");
    });

    it("merges provided options with defaults", () => {
      const renderer = new DefaultRenderer({
        leafSymbol: "• ",
      });
      assertEquals(renderer.options.leafSymbol, "• ");
      assertEquals(renderer.options.indent, " ");
      assertEquals(renderer.options.rootSymbol, "");
      assertEquals(typeof renderer.options.branchSymbol, "function");
    });

    it("allows all options to be overridden", () => {
      const customOptions: DefaultRendererOptions = {
        depth: (item) => item.path.length,
        rootSymbol: "# ",
        leafSymbol: "• ",
        branchSymbol: (item) => item.collapsed ? "▶ " : "▼ ",
        indent: "    ",
      };
      const renderer = new DefaultRenderer(customOptions);
      assertEquals(renderer.options.depth, customOptions.depth);
      assertEquals(renderer.options.rootSymbol, customOptions.rootSymbol);
      assertEquals(renderer.options.leafSymbol, customOptions.leafSymbol);
      assertEquals(renderer.options.branchSymbol, customOptions.branchSymbol);
      assertEquals(renderer.options.indent, customOptions.indent);
    });
  });

  describe("render", () => {
    it("renders empty array for empty items", () => {
      const renderer = new DefaultRenderer();
      const result = renderer.render([]);
      assertEquals(result, []);
    });

    it("renders single root item", () => {
      const renderer = new DefaultRenderer();
      const items: TreeItem[] = [
        {
          label: "Root",
          value: "root",
          path: [],
          type: "branch",
          collapsed: false,
        },
      ];
      const result = renderer.render(items);
      assertEquals(result, ["Root"]);
    });

    it("renders leaf with proper indentation", () => {
      const renderer = new DefaultRenderer();
      const items: TreeItem[] = [
        {
          label: "Root",
          value: "root",
          path: [],
          type: "branch",
          collapsed: false,
        },
        { label: "Leaf 1", value: "leaf1", path: ["root"], type: "leaf" },
      ];
      const result = renderer.render(items);
      assertEquals(result, [
        "Root",
        "|  Leaf 1",
      ]);
    });

    it("renders expanded branch with proper symbol", () => {
      const renderer = new DefaultRenderer();
      const items: TreeItem[] = [
        {
          label: "Root",
          value: "root",
          path: [],
          type: "branch",
          collapsed: false,
        },
        {
          label: "Branch 1",
          value: "branch1",
          path: ["root"],
          type: "branch",
          collapsed: false,
        },
        {
          label: "Leaf 1",
          value: "leaf1",
          path: ["root", "branch1"],
          type: "leaf",
        },
      ];
      const result = renderer.render(items);
      assertEquals(result, [
        "Root",
        "|- Branch 1",
        " |  Leaf 1",
      ]);
    });

    it("renders collapsed branch with proper symbol", () => {
      const renderer = new DefaultRenderer();
      const items: TreeItem[] = [
        {
          label: "Root",
          value: "root",
          path: [],
          type: "branch",
          collapsed: false,
        },
        {
          label: "Branch 1",
          value: "branch1",
          path: ["root"],
          type: "branch",
          collapsed: true,
        },
      ];
      const result = renderer.render(items);
      assertEquals(result, [
        "Root",
        "|+ Branch 1",
      ]);
    });

    it("renders complex tree structure", () => {
      const renderer = new DefaultRenderer();
      const items: TreeItem[] = [
        {
          label: "Project",
          value: "project",
          path: [],
          type: "branch",
          collapsed: false,
        },
        {
          label: "src",
          value: "src",
          path: ["project"],
          type: "branch",
          collapsed: false,
        },
        {
          label: "index.ts",
          value: "index",
          path: ["project", "src"],
          type: "leaf",
        },
        {
          label: "utils.ts",
          value: "utils",
          path: ["project", "src"],
          type: "leaf",
        },
        {
          label: "components",
          value: "components",
          path: ["project", "src"],
          type: "branch",
          collapsed: true,
        },
        {
          label: "tests",
          value: "tests",
          path: ["project"],
          type: "branch",
          collapsed: false,
        },
        {
          label: "index.test.ts",
          value: "index-test",
          path: ["project", "tests"],
          type: "leaf",
        },
        {
          label: "README.md",
          value: "readme",
          path: ["project"],
          type: "leaf",
        },
      ];
      const result = renderer.render(items);
      assertEquals(result, [
        "Project",
        "|- src",
        " |  index.ts",
        " |  utils.ts",
        " |+ components",
        "|- tests",
        " |  index.test.ts",
        "|  README.md",
      ]);
    });

    it("respects custom symbols", () => {
      const renderer = new DefaultRenderer({
        rootSymbol: "🌳 ",
        leafSymbol: "📄 ",
        branchSymbol: (item) => item.collapsed ? "📁 " : "📂 ",
        indent: "  ",
      });
      const items: TreeItem[] = [
        {
          label: "Root",
          value: "root",
          path: [],
          type: "branch",
          collapsed: false,
        },
        {
          label: "Folder",
          value: "folder",
          path: ["root"],
          type: "branch",
          collapsed: false,
        },
        {
          label: "File",
          value: "file",
          path: ["root", "folder"],
          type: "leaf",
        },
        {
          label: "Closed",
          value: "closed",
          path: ["root"],
          type: "branch",
          collapsed: true,
        },
      ];
      const result = renderer.render(items);
      assertEquals(result, [
        "🌳 Root",
        "📂 Folder",
        "  📄 File",
        "📁 Closed",
      ]);
    });

    it("handles deep nesting", () => {
      const renderer = new DefaultRenderer();
      const items: TreeItem[] = [
        {
          label: "Level 0",
          value: "l0",
          path: [],
          type: "branch",
          collapsed: false,
        },
        {
          label: "Level 1",
          value: "l1",
          path: ["l0"],
          type: "branch",
          collapsed: false,
        },
        {
          label: "Level 2",
          value: "l2",
          path: ["l0", "l1"],
          type: "branch",
          collapsed: false,
        },
        {
          label: "Level 3",
          value: "l3",
          path: ["l0", "l1", "l2"],
          type: "branch",
          collapsed: false,
        },
        {
          label: "Deep Leaf",
          value: "leaf",
          path: ["l0", "l1", "l2", "l3"],
          type: "leaf",
        },
      ];
      const result = renderer.render(items);
      assertEquals(result, [
        "Level 0",
        "|- Level 1",
        " |- Level 2",
        "  |- Level 3",
        "   |  Deep Leaf",
      ]);
    });

    it("handles custom indent spacing", () => {
      const renderer = new DefaultRenderer({ indent: "\t" });
      const items: TreeItem[] = [
        {
          label: "Root",
          value: "root",
          path: [],
          type: "branch",
          collapsed: false,
        },
        { label: "Child", value: "child", path: ["root"], type: "leaf" },
        {
          label: "Grandchild",
          value: "grandchild",
          path: ["root", "child"],
          type: "leaf",
        },
      ];
      const result = renderer.render(items);
      assertEquals(result, [
        "Root",
        "|  Child",
        "\t|  Grandchild",
      ]);
    });

    it("implements Renderer interface", () => {
      const renderer: Renderer = new DefaultRenderer();
      const items: TreeItem[] = [
        { label: "Test", value: "test", path: [], type: "leaf" },
      ];
      const result = renderer.render(items);
      assertEquals(result, ["Test"]);
    });

    it("handles custom depth function", () => {
      const renderer = new DefaultRenderer({
        depth: (item) => item.path.length, // Use full path length instead of length - 1
      });
      const items: TreeItem[] = [
        {
          label: "Root",
          value: "root",
          path: [],
          type: "branch",
          collapsed: false,
        },
        {
          label: "Child",
          value: "child",
          path: ["root"],
          type: "branch",
          collapsed: false,
        },
        {
          label: "Grandchild",
          value: "grandchild",
          path: ["root", "child"],
          type: "leaf",
        },
      ];
      const result = renderer.render(items);
      assertEquals(result, [
        "Root",
        " |- Child",
        "  |  Grandchild",
      ]);
    });
  });
});
