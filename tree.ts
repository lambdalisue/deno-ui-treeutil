/**
 * Represents a leaf node in a tree structure.
 * A leaf node has no children and only contains a label and value.
 *
 * @example
 * ```ts
 * const leaf: TreeLeaf = {
 *   label: "Document.txt",
 *   value: "doc-1"
 * };
 * ```
 */
export type TreeLeaf = {
  label: string;
  value: string;
};

/**
 * Represents a branch node in a tree structure.
 * A branch node can contain child nodes and may be collapsed to hide its children.
 *
 * @example
 * ```ts
 * const branch: TreeBranch = {
 *   label: "Folder",
 *   value: "folder-1",
 *   children: [
 *     { label: "File 1", value: "file-1" },
 *     { label: "File 2", value: "file-2" }
 *   ],
 *   collapsed: false
 * };
 * ```
 */
export type TreeBranch = TreeLeaf & {
  children: readonly TreeNode[];
  collapsed?: boolean;
};

/**
 * Represents any node in a tree structure.
 * A node can be either a leaf (no children) or a branch (has children).
 */
export type TreeNode = TreeLeaf | TreeBranch;

/**
 * Represents a tree data structure with a single root node.
 *
 * @example
 * ```ts
 * const tree: Tree = {
 *   root: {
 *     label: "Root",
 *     value: "root",
 *     children: [
 *       { label: "File 1", value: "file-1" },
 *       {
 *         label: "Folder",
 *         value: "folder-1",
 *         children: [
 *           { label: "File 2", value: "file-2" }
 *         ]
 *       }
 *     ]
 *   }
 * };
 * ```
 */
export type Tree = {
  root: TreeNode;
};

/**
 * Represents a flattened leaf item for display purposes.
 * Includes a type discriminator to distinguish from branch items.
 *
 * @example
 * ```ts
 * const leafItem: TreeLeafItem = {
 *   label: "Document.txt",
 *   value: "doc-1",
 *   path: ["folder-1", "subfolder-1", "doc-1"],
 *   type: "leaf"
 * };
 * ```
 */
export type TreeLeafItem = TreeLeaf & {
  path: readonly string[];
  type: "leaf";
};

/**
 * Represents a flattened branch item for display purposes.
 * Includes a type discriminator and explicit collapsed state.
 *
 * @example
 * ```ts
 * const branchItem: TreeBranchItem = {
 *   label: "Folder",
 *   value: "subfolder-1",
 *   path: ["folder-1", "subfolder-1"],
 *   type: "branch",
 *   collapsed: false
 * };
 * ```
 */
export type TreeBranchItem = TreeLeaf & {
  path: readonly string[];
  type: "branch";
  collapsed: boolean;
};

/**
 * Represents a flattened tree item for display purposes.
 * Used by getVisibleItems to provide a flat list of visible nodes.
 */
export type TreeItem = TreeLeafItem | TreeBranchItem;

/**
 * Type guard to check if a value is a TreeLeaf.
 *
 * @param x - The value to check
 * @returns True if the value is a valid TreeLeaf
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert@^1.0.0";
 * import { isTreeLeaf } from "./tree.ts";
 *
 * const leaf = { label: "File", value: "file-1" };
 * const branch = { label: "Folder", value: "folder-1", children: [] };
 *
 * assertEquals(isTreeLeaf(leaf), true);
 * assertEquals(isTreeLeaf(branch), false);
 * assertEquals(isTreeLeaf(null), false);
 * assertEquals(isTreeLeaf({ label: "File" }), false);
 * ```
 */
export function isTreeLeaf(x: unknown): x is TreeLeaf {
  return (
    typeof x === "object" &&
    x !== null &&
    "label" in x &&
    "value" in x &&
    typeof x.label === "string" &&
    typeof x.value === "string" &&
    !("children" in x)
  );
}

/**
 * Type guard to check if a value is a TreeBranch.
 * This is a non-strict check that doesn't validate children.
 *
 * @param x - The value to check
 * @returns True if the value is a valid TreeBranch
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert@^1.0.0";
 * import { isTreeBranch } from "./tree.ts";
 *
 * const branch = {
 *   label: "Folder",
 *   value: "folder-1",
 *   children: []
 * };
 * const leaf = { label: "File", value: "file-1" };
 *
 * assertEquals(isTreeBranch(branch), true);
 * assertEquals(isTreeBranch(leaf), false);
 *
 * // Non-strict: accepts invalid children
 * const invalidBranch = {
 *   label: "Folder",
 *   value: "folder-1",
 *   children: [{ invalid: "node" }]
 * };
 * assertEquals(isTreeBranch(invalidBranch), true);
 * ```
 */
export function isTreeBranch(x: unknown): x is TreeBranch {
  if (
    typeof x !== "object" ||
    x === null ||
    !("label" in x) ||
    !("value" in x) ||
    !("children" in x) ||
    typeof x.label !== "string" ||
    typeof x.value !== "string"
  ) {
    return false;
  }

  if (!Array.isArray(x.children)) {
    return false;
  }

  if ("collapsed" in x && typeof x.collapsed !== "boolean") {
    return false;
  }

  return true;
}

/**
 * Type guard to check if a value is a TreeBranch with valid children.
 * This is a strict check that recursively validates all children.
 *
 * @param x - The value to check
 * @returns True if the value is a valid TreeBranch with valid children
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert@^1.0.0";
 * import { isTreeBranchStrict } from "./tree.ts";
 *
 * const validBranch = {
 *   label: "Folder",
 *   value: "folder-1",
 *   children: [
 *     { label: "File", value: "file-1" }
 *   ]
 * };
 *
 * const invalidBranch = {
 *   label: "Folder",
 *   value: "folder-1",
 *   children: [{ invalid: "node" }]
 * };
 *
 * assertEquals(isTreeBranchStrict(validBranch), true);
 * assertEquals(isTreeBranchStrict(invalidBranch), false);
 * ```
 */
export function isTreeBranchStrict(x: unknown): x is TreeBranch {
  if (!isTreeBranch(x)) {
    return false;
  }
  // Check children recursively
  return x.children.every((child: unknown) => isTreeNodeStrict(child));
}

/**
 * Type guard to check if a value is a TreeNode (leaf or branch).
 * This is a non-strict check that doesn't validate branch children.
 *
 * @param x - The value to check
 * @returns True if the value is a valid TreeNode
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert@^1.0.0";
 * import { isTreeNode } from "./tree.ts";
 *
 * const leaf = { label: "File", value: "file-1" };
 * const branch = { label: "Folder", value: "folder-1", children: [] };
 *
 * assertEquals(isTreeNode(leaf), true);
 * assertEquals(isTreeNode(branch), true);
 * assertEquals(isTreeNode(null), false);
 * assertEquals(isTreeNode({ label: "Test" }), false);
 * ```
 */
export function isTreeNode(x: unknown): x is TreeNode {
  return isTreeLeaf(x) || isTreeBranch(x);
}

/**
 * Type guard to check if a value is a TreeNode with valid children.
 * This is a strict check that recursively validates branch children.
 *
 * @param x - The value to check
 * @returns True if the value is a valid TreeNode
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert@^1.0.0";
 * import { isTreeNodeStrict } from "./tree.ts";
 *
 * const validBranch = {
 *   label: "Folder",
 *   value: "folder-1",
 *   children: [
 *     { label: "File", value: "file-1" }
 *   ]
 * };
 *
 * const invalidBranch = {
 *   label: "Folder",
 *   value: "folder-1",
 *   children: [{ invalid: "node" }]
 * };
 *
 * assertEquals(isTreeNodeStrict(validBranch), true);
 * assertEquals(isTreeNodeStrict(invalidBranch), false);
 * ```
 */
export function isTreeNodeStrict(x: unknown): x is TreeNode {
  return isTreeLeaf(x) || isTreeBranchStrict(x);
}

/**
 * Type guard to check if a value is a valid Tree.
 * Uses non-strict validation for the root node.
 *
 * @param x - The value to check
 * @returns True if the value is a valid Tree
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert@^1.0.0";
 * import { isTree } from "./tree.ts";
 *
 * const validTree = {
 *   root: { label: "Root", value: "root" }
 * };
 *
 * const invalidTree = {
 *   root: { label: "Root" } // missing value
 * };
 *
 * assertEquals(isTree(validTree), true);
 * assertEquals(isTree(invalidTree), false);
 * assertEquals(isTree({}), false);
 * assertEquals(isTree(null), false);
 * ```
 */
export function isTree(x: unknown): x is Tree {
  return (
    typeof x === "object" &&
    x !== null &&
    "root" in x &&
    isTreeNode(x.root)
  );
}

/**
 * Type guard to check if a value is a TreeItem.
 *
 * @param x - The value to check
 * @returns True if the value is a valid TreeItem
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert@^1.0.0";
 * import { isTreeItem } from "./tree.ts";
 *
 * const leafItem = { label: "File", value: "file-1", path: [], type: "leaf" };
 * const branchItem = { label: "Folder", value: "folder-1", path: [], type: "branch", collapsed: false };
 * const invalidBranch = { label: "Folder", value: "folder-1", type: "branch" }; // missing path and collapsed
 *
 * assertEquals(isTreeItem(leafItem), true);
 * assertEquals(isTreeItem(branchItem), true);
 * assertEquals(isTreeItem(invalidBranch), false);
 * assertEquals(isTreeItem({ label: "Test", value: "test" }), false);
 * ```
 */
export function isTreeItem(x: unknown): x is TreeItem {
  if (
    typeof x !== "object" ||
    x === null ||
    !("label" in x) ||
    !("value" in x) ||
    !("type" in x) ||
    !("path" in x) ||
    typeof x.label !== "string" ||
    typeof x.value !== "string" ||
    !Array.isArray(x.path)
  ) {
    return false;
  }

  // Check that path contains only strings
  if (!x.path.every((p: unknown) => typeof p === "string")) {
    return false;
  }

  if (x.type === "leaf") {
    return true;
  }

  if (x.type === "branch") {
    return "collapsed" in x && typeof x.collapsed === "boolean";
  }

  return false;
}

/**
 * Type guard to check if a value is a TreeLeafItem.
 *
 * @param x - The value to check
 * @returns True if the value is a valid TreeLeafItem
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert@^1.0.0";
 * import { isTreeLeafItem } from "./tree.ts";
 *
 * const leafItem = { label: "File", value: "file-1", path: [], type: "leaf" };
 * const branchItem = { label: "Folder", value: "folder-1", path: [], type: "branch", collapsed: false };
 *
 * assertEquals(isTreeLeafItem(leafItem), true);
 * assertEquals(isTreeLeafItem(branchItem), false);
 * ```
 */
export function isTreeLeafItem(x: unknown): x is TreeLeafItem {
  return isTreeItem(x) && x.type === "leaf";
}

/**
 * Type guard to check if a value is a TreeBranchItem.
 *
 * @param x - The value to check
 * @returns True if the value is a valid TreeBranchItem
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert@^1.0.0";
 * import { isTreeBranchItem } from "./tree.ts";
 *
 * const branchItem = { label: "Folder", value: "folder-1", path: [], type: "branch", collapsed: true };
 * const leafItem = { label: "File", value: "file-1", path: [], type: "leaf" };
 * const invalidBranch = { label: "Folder", value: "folder-1", type: "branch" }; // missing path and collapsed
 *
 * assertEquals(isTreeBranchItem(branchItem), true);
 * assertEquals(isTreeBranchItem(leafItem), false);
 * assertEquals(isTreeBranchItem(invalidBranch), false);
 * ```
 */
export function isTreeBranchItem(x: unknown): x is TreeBranchItem {
  return isTreeItem(x) && x.type === "branch";
}

/**
 * Expands a tree node at the specified path and returns a new tree.
 * The original tree is not modified (immutable operation).
 *
 * @param tree - The tree containing the node to expand
 * @param path - Array of node values representing the path to the target node
 * @returns A new tree with the specified node expanded
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert@^1.0.0";
 * import { expandNode, type Tree, type TreeBranch } from "./tree.ts";
 *
 * const tree: Tree = {
 *   root: {
 *     label: "Root",
 *     value: "root",
 *     children: [{
 *       label: "Folder",
 *       value: "folder-1",
 *       children: [
 *         { label: "File", value: "file-1" }
 *       ],
 *       collapsed: true
 *     }]
 *   }
 * };
 *
 * // Expand the folder
 * const expanded = expandNode(tree, ["folder-1"]);
 * const expandedFolder = (expanded.root as TreeBranch).children[0] as TreeBranch;
 * assertEquals(expandedFolder.collapsed, false);
 *
 * // Original tree is unchanged
 * const originalFolder = (tree.root as TreeBranch).children[0] as TreeBranch;
 * assertEquals(originalFolder.collapsed, true);
 *
 * // Expanding a leaf does nothing
 * const leafTree: Tree = { root: { label: "Leaf", value: "leaf" } };
 * const expandedLeaf = expandNode(leafTree, []);
 * assertEquals(expandedLeaf, leafTree);
 * ```
 */
export function expandNode(
  tree: Readonly<Tree>,
  path: readonly string[],
): Tree {
  function expandNodeRecursive(
    node: TreeNode,
    currentPath: readonly string[],
  ): TreeNode {
    if (currentPath.length === 0) {
      if ("children" in node) {
        return { ...node, collapsed: false };
      }
      return node;
    }

    const [current, ...rest] = currentPath;
    if ("children" in node) {
      return {
        ...node,
        children: node.children.map((child) =>
          child.value === current ? expandNodeRecursive(child, rest) : child
        ),
      };
    }

    return node;
  }

  return {
    root: expandNodeRecursive(tree.root, path),
  };
}

/**
 * Collapses a tree node at the specified path and returns a new tree.
 * The original tree is not modified (immutable operation).
 *
 * @param tree - The tree containing the node to collapse
 * @param path - Array of node values representing the path to the target node
 * @returns A new tree with the specified node collapsed
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert@^1.0.0";
 * import { collapseNode, type Tree, type TreeBranch } from "./tree.ts";
 *
 * const tree: Tree = {
 *   root: {
 *     label: "Root",
 *     value: "root",
 *     children: [{
 *       label: "Folder",
 *       value: "folder-1",
 *       children: [
 *         { label: "File", value: "file-1" }
 *       ],
 *       collapsed: false
 *     }]
 *   }
 * };
 *
 * // Collapse the folder
 * const collapsed = collapseNode(tree, ["folder-1"]);
 * const collapsedFolder = (collapsed.root as TreeBranch).children[0] as TreeBranch;
 * assertEquals(collapsedFolder.collapsed, true);
 *
 * // Original tree is unchanged
 * const originalFolder = (tree.root as TreeBranch).children[0] as TreeBranch;
 * assertEquals(originalFolder.collapsed, false);
 *
 * // Collapsing a leaf does nothing
 * const leafTree: Tree = { root: { label: "Leaf", value: "leaf" } };
 * const collapsedLeaf = collapseNode(leafTree, []);
 * assertEquals(collapsedLeaf, leafTree);
 * ```
 */
export function collapseNode(
  tree: Readonly<Tree>,
  path: readonly string[],
): Tree {
  function collapseNodeRecursive(
    node: TreeNode,
    currentPath: readonly string[],
  ): TreeNode {
    if (currentPath.length === 0) {
      if ("children" in node) {
        return { ...node, collapsed: true };
      }
      return node;
    }

    const [current, ...rest] = currentPath;
    if ("children" in node) {
      return {
        ...node,
        children: node.children.map((child) =>
          child.value === current ? collapseNodeRecursive(child, rest) : child
        ),
      };
    }

    return node;
  }

  return {
    root: collapseNodeRecursive(tree.root, path),
  };
}

/**
 * Gets all visible items from a tree as a flat array.
 * Children of collapsed nodes are excluded from the result.
 * Each item includes a type discriminator and collapsed state for branches.
 *
 * @param tree - The tree to get visible items from
 * @returns Array of visible tree items in depth-first order
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert@^1.0.0";
 * import { getVisibleItems, collapseNode, type Tree } from "./tree.ts";
 *
 * const tree: Tree = {
 *   root: {
 *     label: "Root",
 *     value: "root",
 *     children: [{
 *       label: "Folder 1",
 *       value: "folder-1",
 *       children: [
 *         { label: "File 1", value: "file-1" },
 *         { label: "File 2", value: "file-2" }
 *       ],
 *       collapsed: false
 *     }, {
 *       label: "Folder 2",
 *       value: "folder-2",
 *       children: [
 *         { label: "File 3", value: "file-3" }
 *       ],
 *       collapsed: true
 *     }]
 *   }
 * };
 *
 * const items = getVisibleItems(tree);
 * assertEquals(items.length, 5); // root, folder-1, file-1, file-2, folder-2
 * assertEquals(items.map(i => i.value), ["root", "folder-1", "file-1", "file-2", "folder-2"]);
 *
 * // Check item types
 * assertEquals(items[0].type, "branch"); // root
 * assertEquals(items[1].type, "branch"); // folder-1
 * assertEquals(items[2].type, "leaf");   // file-1
 * assertEquals(items[3].type, "leaf");   // file-2
 * assertEquals(items[4].type, "branch"); // folder-2
 *
 * // Check collapsed state for branches
 * assertEquals(items[0].type === "branch" && items[0].collapsed, false);
 * assertEquals(items[1].type === "branch" && items[1].collapsed, false);
 * assertEquals(items[4].type === "branch" && items[4].collapsed, true);
 *
 * // Check paths
 * assertEquals(items[0].path, []); // root
 * assertEquals(items[1].path, ["folder-1"]); // folder-1
 * assertEquals(items[2].path, ["folder-1", "file-1"]); // file-1
 * assertEquals(items[3].path, ["folder-1", "file-2"]); // file-2
 * assertEquals(items[4].path, ["folder-2"]); // folder-2
 *
 * // Collapse folder-1 and check again
 * const collapsed = collapseNode(tree, ["folder-1"]);
 * const collapsedItems = getVisibleItems(collapsed);
 * assertEquals(collapsedItems.length, 3); // root, folder-1, folder-2
 * assertEquals(collapsedItems.map(i => i.value), ["root", "folder-1", "folder-2"]);
 * ```
 */
export function getVisibleItems(tree: Readonly<Tree>): TreeItem[] {
  const result: TreeItem[] = [];

  function traverse(node: TreeNode, path: readonly string[]): void {
    if ("children" in node) {
      const item: TreeItem = {
        label: node.label,
        value: node.value,
        path,
        type: "branch",
        collapsed: node.collapsed ?? false,
      };
      result.push(item);
    } else {
      const item: TreeItem = {
        label: node.label,
        value: node.value,
        path,
        type: "leaf",
      };
      result.push(item);
    }

    if ("children" in node && !node.collapsed) {
      for (const child of node.children) {
        traverse(child, [...path, child.value]);
      }
    }
  }

  traverse(tree.root, []);
  return result;
}
