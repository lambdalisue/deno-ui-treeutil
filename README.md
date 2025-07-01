# deno-ui-treeutil

[![JSR](https://jsr.io/badges/@lambdalisue/ui-treeutil)](https://jsr.io/@lambdalisue/ui-treeutil)
[![Test](https://github.com/lambdalisue/deno-ui-treeutil/actions/workflows/test.yml/badge.svg)](https://github.com/lambdalisue/deno-ui-treeutil/actions/workflows/test.yml)

A tree data structure utility library for Deno, providing immutable tree operations and customizable rendering capabilities.

## Features

- 🌳 **Immutable tree operations** - All operations return new trees without modifying the original
- 📁 **Expand/collapse nodes** - Built-in support for collapsible tree branches
- 🎨 **Customizable rendering** - Flexible tree rendering with configurable symbols and indentation
- 🔍 **Visibility management** - Get visible items based on collapsed state
- 📝 **Type-safe** - Full TypeScript support with comprehensive type guards
- 🧪 **Well-tested** - Extensive test coverage with BDD-style tests

## Installation

```bash
deno add @lambdalisue/ui-treeutil
```

## Usage

### Basic Tree Structure

```typescript
import { type Tree, expandNode, collapseNode, getVisibleItems } from "@lambdalisue/ui-treeutil";

// Create a tree structure
const tree: Tree = {
  root: {
    label: "Root",
    value: "root",
    children: [
      {
        label: "Folder 1",
        value: "folder1",
        children: [
          { label: "File 1", value: "file1" },
          { label: "File 2", value: "file2" }
        ],
        collapsed: false
      },
      { label: "File 3", value: "file3" }
    ]
  }
};

// Collapse a node
const collapsedTree = collapseNode(tree, ["folder1"]);

// Expand a node
const expandedTree = expandNode(collapsedTree, ["folder1"]);

// Get visible items (excludes children of collapsed nodes)
const visibleItems = getVisibleItems(tree);
```

### Rendering Trees

```typescript
import { DefaultRenderer, getVisibleItems, type Tree } from "@lambdalisue/ui-treeutil";

// Assume we have a tree from the previous example
const tree: Tree = {
  root: {
    label: "Root",
    value: "root",
    children: [
      {
        label: "Folder 1",
        value: "folder1",
        children: [
          { label: "File 1", value: "file1" },
          { label: "File 2", value: "file2" }
        ],
        collapsed: false
      },
      { label: "File 3", value: "file3" }
    ]
  }
};

// Create a renderer with default options
const renderer = new DefaultRenderer();

// Get visible items and render them
const items = getVisibleItems(tree);
const lines = renderer.render(items);

console.log(lines.join("\n"));
// Output:
// Root
// |- Folder 1
//  |  File 1
//  |  File 2
// |  File 3
```

### Custom Rendering

```typescript
import { DefaultRenderer, getVisibleItems, type Tree, type TreeBranchItem } from "@lambdalisue/ui-treeutil";

// Using the same tree structure
const tree: Tree = {
  root: {
    label: "Root",
    value: "root",
    children: [
      {
        label: "Folder 1",
        value: "folder1",
        children: [
          { label: "File 1", value: "file1" },
          { label: "File 2", value: "file2" }
        ],
        collapsed: false
      },
      { label: "File 3", value: "file3" }
    ]
  }
};

const customRenderer = new DefaultRenderer({
  indent: "  ",
  rootSymbol: "🌳 ",
  leafSymbol: "📄 ",
  branchSymbol: (item: TreeBranchItem) => item.collapsed ? "📁 " : "📂 "
});

const items = getVisibleItems(tree);
const lines = customRenderer.render(items);
// Output:
// 🌳 Root
// 📂 Folder 1
//   📄 File 1
//   📄 File 2
// 📄 File 3
```

## API Reference

### Types

#### `Tree`
The root container for a tree structure.

#### `TreeNode`
A node in the tree, can be either a `TreeLeaf` or `TreeBranch`.

#### `TreeLeaf`
A terminal node with no children.

#### `TreeBranch`
A node that can contain child nodes and may be collapsed.

#### `TreeItem`
A flattened representation of a tree node used for rendering.

### Functions

#### `expandNode(tree, path)`
Expands a collapsed node at the specified path.

#### `collapseNode(tree, path)`
Collapses an expanded node at the specified path.

#### `getVisibleItems(tree)`
Returns all visible items in the tree as a flat array, excluding children of collapsed nodes.

### Type Guards

- `isTree(x)` - Check if a value is a valid Tree
- `isTreeNode(x)` - Check if a value is a valid TreeNode
- `isTreeLeaf(x)` - Check if a value is a valid TreeLeaf
- `isTreeBranch(x)` - Check if a value is a valid TreeBranch
- `isTreeItem(x)` - Check if a value is a valid TreeItem

### Renderer

#### `DefaultRenderer`
A customizable renderer for tree items.

**Options:**
- `depth` - Function to calculate indentation depth (default: based on path length)
- `indent` - String used for indentation (default: single space)
- `rootSymbol` - Symbol for root items (default: empty string)
- `leafSymbol` - Symbol for leaf nodes (default: "|  ")
- `branchSymbol` - Symbol for branch nodes (default: collapsed ? "|+ " : "|- ")

## License

MIT License - see [LICENSE](LICENSE) for details.