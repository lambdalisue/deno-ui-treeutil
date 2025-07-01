import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";
import { assert } from "@core/unknownutil/assert";
import {
  collapseNode,
  expandNode,
  getVisibleItems,
  isTree,
  isTreeBranch,
  isTreeBranchItem,
  isTreeBranchStrict,
  isTreeItem,
  isTreeLeaf,
  isTreeLeafItem,
  isTreeNode,
  isTreeNodeStrict,
  type Tree,
  type TreeBranch,
  type TreeBranchItem,
  type TreeItem,
  type TreeLeaf,
  type TreeLeafItem,
} from "./tree.ts";

describe("Tree utilities", () => {
  let sampleTree: Tree;

  beforeEach(() => {
    const leaf1: TreeLeaf = { label: "Leaf 1", value: "leaf1" };
    const leaf2: TreeLeaf = { label: "Leaf 2", value: "leaf2" };
    const leaf3: TreeLeaf = { label: "Leaf 3", value: "leaf3" };
    const leaf4: TreeLeaf = { label: "Leaf 4", value: "leaf4" };

    const branch2: TreeBranch = {
      label: "Branch 2",
      value: "branch2",
      children: [leaf3, leaf4],
      collapsed: false,
    };

    const branch1: TreeBranch = {
      label: "Branch 1",
      value: "branch1",
      children: [leaf1, leaf2, branch2],
      collapsed: false,
    };

    const root: TreeBranch = {
      label: "Root",
      value: "root",
      children: [branch1],
      collapsed: false,
    };

    sampleTree = { root };
  });

  describe("expandNode", () => {
    it("expands a collapsed node", () => {
      const collapsedTree = collapseNode(sampleTree, ["branch1"]);
      const { root } = collapsedTree;
      
      assert(root, isTreeBranch);
      
      const branch1 = root.children[0];
      assertExists(branch1);
      assert(branch1, isTreeBranch);
      
      assertEquals(branch1.collapsed, true);

      const expandedTree = expandNode(collapsedTree, ["branch1"]);
      const expandedRoot = expandedTree.root;
      
      assert(expandedRoot, isTreeBranch);
      
      const expandedBranch1 = expandedRoot.children[0];
      assertExists(expandedBranch1);
      assert(expandedBranch1, isTreeBranch);
      
      assertEquals(expandedBranch1.collapsed, false);
    });

    it("does not affect leaf nodes", () => {
      const tree: Tree = {
        root: { label: "Leaf", value: "leaf" },
      };
      
      const result = expandNode(tree, []);
      assertEquals(result, tree);
    });

    it("works with nested paths", () => {
      const collapsedTree = collapseNode(sampleTree, ["branch1", "branch2"]);
      const expandedTree = expandNode(collapsedTree, ["branch1", "branch2"]);
      
      const { root } = expandedTree;
      assert(root, isTreeBranch);
      
      const branch1 = root.children[0];
      assert(branch1, isTreeBranch);
      
      const branch2 = branch1.children[2];
      assert(branch2, isTreeBranch);
      
      assertEquals(branch2.collapsed, false);
    });

    it("does not modify the original tree", () => {
      const originalTree: Tree = {
        root: {
          label: "Root",
          value: "root",
          children: [{
            label: "Branch",
            value: "branch",
            children: [],
            collapsed: true,
          }],
        },
      };
      
      const originalTreeClone = JSON.parse(JSON.stringify(originalTree));
      
      const expandedTree = expandNode(originalTree, ["branch"]);
      
      assertEquals(originalTree, originalTreeClone);
      
      const { root: origRoot } = originalTree;
      const { root: expRoot } = expandedTree;
      assert(origRoot, isTreeBranch);
      assert(expRoot, isTreeBranch);
      
      const origBranch = origRoot.children[0];
      const expBranch = expRoot.children[0];
      assert(origBranch, isTreeBranch);
      assert(expBranch, isTreeBranch);
      
      assertEquals(origBranch.collapsed, true);
      assertEquals(expBranch.collapsed, false);
    });
  });

  describe("collapseNode", () => {
    it("collapses an expanded node", () => {
      const collapsedTree = collapseNode(sampleTree, ["branch1"]);
      const { root } = collapsedTree;
      
      assert(root, isTreeBranch);
      
      const branch1 = root.children[0];
      assert(branch1, isTreeBranch);
      
      assertEquals(branch1.collapsed, true);
    });

    it("does not affect leaf nodes", () => {
      const tree: Tree = {
        root: { label: "Leaf", value: "leaf" },
      };
      
      const result = collapseNode(tree, []);
      assertEquals(result, tree);
    });

    it("works with nested paths", () => {
      const collapsedTree = collapseNode(sampleTree, ["branch1", "branch2"]);
      const { root } = collapsedTree;
      
      assert(root, isTreeBranch);
      
      const branch1 = root.children[0];
      assert(branch1, isTreeBranch);
      
      const branch2 = branch1.children[2];
      assert(branch2, isTreeBranch);
      
      assertEquals(branch2.collapsed, true);
    });

    it("does not modify the original tree", () => {
      const originalTree: Tree = {
        root: {
          label: "Root",
          value: "root",
          children: [{
            label: "Branch",
            value: "branch",
            children: [],
            collapsed: false,
          }],
        },
      };
      
      const originalTreeClone = JSON.parse(JSON.stringify(originalTree));
      
      const collapsedTree = collapseNode(originalTree, ["branch"]);
      
      assertEquals(originalTree, originalTreeClone);
      
      const { root: origRoot } = originalTree;
      const { root: colRoot } = collapsedTree;
      assert(origRoot, isTreeBranch);
      assert(colRoot, isTreeBranch);
      
      const origBranch = origRoot.children[0];
      const colBranch = colRoot.children[0];
      assert(origBranch, isTreeBranch);
      assert(colBranch, isTreeBranch);
      
      assertEquals(origBranch.collapsed, false);
      assertEquals(colBranch.collapsed, true);
    });
  });

  describe("getVisibleItems", () => {
    it("returns all items when nothing is collapsed", () => {
      const items = getVisibleItems(sampleTree);
      
      assertEquals(items.length, 7);
      assertEquals(items[0].value, "root");
      assertEquals(items[0].type, "branch");
      if (items[0].type === "branch") {
        assertEquals(items[0].collapsed, false);
      }
      assertEquals(items[1].value, "branch1");
      assertEquals(items[1].type, "branch");
      if (items[1].type === "branch") {
        assertEquals(items[1].collapsed, false);
      }
      assertEquals(items[2].value, "leaf1");
      assertEquals(items[2].type, "leaf");
      assertEquals(items[3].value, "leaf2");
      assertEquals(items[3].type, "leaf");
      assertEquals(items[4].value, "branch2");
      assertEquals(items[4].type, "branch");
      if (items[4].type === "branch") {
        assertEquals(items[4].collapsed, false);
      }
      assertEquals(items[5].value, "leaf3");
      assertEquals(items[5].type, "leaf");
      assertEquals(items[6].value, "leaf4");
      assertEquals(items[6].type, "leaf");
      
      // Check paths
      assertEquals(items[0].path, []); // root
      assertEquals(items[1].path, ["branch1"]); // branch1
      assertEquals(items[2].path, ["branch1", "leaf1"]); // leaf1
      assertEquals(items[3].path, ["branch1", "leaf2"]); // leaf2
      assertEquals(items[4].path, ["branch1", "branch2"]); // branch2
      assertEquals(items[5].path, ["branch1", "branch2", "leaf3"]); // leaf3
      assertEquals(items[6].path, ["branch1", "branch2", "leaf4"]); // leaf4
    });

    it("skips children of collapsed nodes", () => {
      const collapsedTree = collapseNode(sampleTree, ["branch1"]);
      const items = getVisibleItems(collapsedTree);
      
      assertEquals(items.length, 2);
      assertEquals(items[0].value, "root");
      assertEquals(items[0].type, "branch");
      if (items[0].type === "branch") {
        assertEquals(items[0].collapsed, false);
      }
      assertEquals(items[1].value, "branch1");
      assertEquals(items[1].type, "branch");
      if (items[1].type === "branch") {
        assertEquals(items[1].collapsed, true);
      }
      
      // Check paths
      assertEquals(items[0].path, []); // root
      assertEquals(items[1].path, ["branch1"]); // branch1
    });

    it("handles partially collapsed tree", () => {
      const collapsedTree = collapseNode(sampleTree, ["branch1", "branch2"]);
      const items = getVisibleItems(collapsedTree);
      
      assertEquals(items.length, 5);
      assertEquals(items[0].value, "root");
      assertEquals(items[0].type, "branch");
      if (items[0].type === "branch") {
        assertEquals(items[0].collapsed, false);
      }
      assertEquals(items[1].value, "branch1");
      assertEquals(items[1].type, "branch");
      if (items[1].type === "branch") {
        assertEquals(items[1].collapsed, false);
      }
      assertEquals(items[2].value, "leaf1");
      assertEquals(items[2].type, "leaf");
      assertEquals(items[3].value, "leaf2");
      assertEquals(items[3].type, "leaf");
      assertEquals(items[4].value, "branch2");
      assertEquals(items[4].type, "branch");
      if (items[4].type === "branch") {
        assertEquals(items[4].collapsed, true);
      }
      
      // Check paths
      assertEquals(items[0].path, []); // root
      assertEquals(items[1].path, ["branch1"]); // branch1
      assertEquals(items[2].path, ["branch1", "leaf1"]); // leaf1
      assertEquals(items[3].path, ["branch1", "leaf2"]); // leaf2
      assertEquals(items[4].path, ["branch1", "branch2"]); // branch2
    });

    it("handles single leaf node", () => {
      const tree: Tree = {
        root: { label: "Single Leaf", value: "leaf" },
      };
      
      const items = getVisibleItems(tree);
      assertEquals(items.length, 1);
      assertEquals(items[0].value, "leaf");
      assertEquals(items[0].type, "leaf");
      assertEquals(items[0].path, []); // root leaf
    });

    it("does not modify the original tree", () => {
      const originalTree: Tree = {
        root: {
          label: "Root",
          value: "root",
          children: [{
            label: "Branch1",
            value: "branch1",
            children: [{
              label: "Leaf",
              value: "leaf",
            }],
            collapsed: false,
          }],
        },
      };
      
      const originalTreeClone = JSON.parse(JSON.stringify(originalTree));
      
      const items = getVisibleItems(originalTree);
      
      assertEquals(originalTree, originalTreeClone);
      
      assertEquals(items.length, 3);
      assertEquals(items[0].value, "root");
      assertEquals(items[0].type, "branch");
      if (items[0].type === "branch") {
        assertEquals(items[0].collapsed, false);
      }
      assertEquals(items[1].value, "branch1");
      assertEquals(items[1].type, "branch");
      if (items[1].type === "branch") {
        assertEquals(items[1].collapsed, false);
      }
      assertEquals(items[2].value, "leaf");
      assertEquals(items[2].type, "leaf");
      
      // Check paths
      assertEquals(items[0].path, []); // root
      assertEquals(items[1].path, ["branch1"]); // branch1
      assertEquals(items[2].path, ["branch1", "leaf"]); // leaf
    });
  });

  describe("Type guards", () => {
    describe("isTreeLeaf", () => {
      it("identifies valid tree leaf", () => {
        const leaf: TreeLeaf = { label: "Test", value: "test" };
        assertEquals(isTreeLeaf(leaf), true);
      });

      it("rejects branches", () => {
        const branch = { label: "Test", value: "test", children: [] };
        assertEquals(isTreeLeaf(branch), false);
      });

      it("rejects invalid objects", () => {
        assertEquals(isTreeLeaf(null), false);
        assertEquals(isTreeLeaf(undefined), false);
        assertEquals(isTreeLeaf({}), false);
        assertEquals(isTreeLeaf({ label: "Test" }), false);
        assertEquals(isTreeLeaf({ value: "test" }), false);
        assertEquals(isTreeLeaf({ label: 123, value: "test" }), false);
        assertEquals(isTreeLeaf({ label: "Test", value: 123 }), false);
      });
    });

    describe("isTreeBranch", () => {
      it("identifies valid tree branch", () => {
        const branch: TreeBranch = {
          label: "Branch",
          value: "branch",
          children: [],
          collapsed: false,
        };
        assertEquals(isTreeBranch(branch), true);
      });

      it("accepts branch without collapsed property", () => {
        const branchNoCollapsed = {
          label: "Branch",
          value: "branch",
          children: [],
        };
        assertEquals(isTreeBranch(branchNoCollapsed), true);
      });

      it("accepts branch with invalid children (non-strict)", () => {
        const branchWithInvalidChildren = {
          label: "Branch",
          value: "branch",
          children: [{ invalid: "node" }],
        };
        assertEquals(isTreeBranch(branchWithInvalidChildren), true);
      });

      it("rejects leaves", () => {
        const leaf = { label: "Test", value: "test" };
        assertEquals(isTreeBranch(leaf), false);
      });

      it("rejects invalid objects", () => {
        assertEquals(isTreeBranch(null), false);
        assertEquals(isTreeBranch(undefined), false);
        assertEquals(isTreeBranch({}), false);
        assertEquals(isTreeBranch({ label: "Test", value: "test", children: "not array" }), false);
        assertEquals(isTreeBranch({ label: "Test", value: "test", children: [], collapsed: "not boolean" }), false);
      });
    });

    describe("isTreeBranchStrict", () => {
      it("identifies valid tree branch with valid children", () => {
        const branch: TreeBranch = {
          label: "Branch",
          value: "branch",
          children: [
            { label: "Leaf", value: "leaf" },
            { label: "SubBranch", value: "subbranch", children: [] },
          ],
          collapsed: false,
        };
        assertEquals(isTreeBranchStrict(branch), true);
      });

      it("accepts empty children array", () => {
        const branch: TreeBranch = {
          label: "Branch",
          value: "branch",
          children: [],
        };
        assertEquals(isTreeBranchStrict(branch), true);
      });

      it("rejects branch with invalid children", () => {
        const branchWithInvalidChildren = {
          label: "Branch",
          value: "branch",
          children: [{ invalid: "node" }],
        };
        assertEquals(isTreeBranchStrict(branchWithInvalidChildren), false);
      });

      it("rejects branch with partially invalid children", () => {
        const branchWithMixedChildren = {
          label: "Branch",
          value: "branch",
          children: [
            { label: "Valid", value: "valid" },
            { invalid: "node" },
          ],
        };
        assertEquals(isTreeBranchStrict(branchWithMixedChildren), false);
      });

      it("validates nested branches recursively", () => {
        const deeplyNestedBranch = {
          label: "Root",
          value: "root",
          children: [{
            label: "Level1",
            value: "level1",
            children: [{
              label: "Level2",
              value: "level2",
              children: [{
                label: "Leaf",
                value: "leaf",
              }],
            }],
          }],
        };
        assertEquals(isTreeBranchStrict(deeplyNestedBranch), true);
      });
    });

    describe("isTreeNode", () => {
      it("identifies valid leaf nodes", () => {
        const leaf: TreeLeaf = { label: "Leaf", value: "leaf" };
        assertEquals(isTreeNode(leaf), true);
      });

      it("identifies valid branch nodes", () => {
        const branch: TreeBranch = {
          label: "Branch",
          value: "branch",
          children: [],
        };
        assertEquals(isTreeNode(branch), true);
      });

      it("accepts branch with invalid children (non-strict)", () => {
        const branchWithInvalidChildren = {
          label: "Branch",
          value: "branch",
          children: [{ invalid: "node" }],
        };
        assertEquals(isTreeNode(branchWithInvalidChildren), true);
      });

      it("rejects invalid objects", () => {
        assertEquals(isTreeNode(null), false);
        assertEquals(isTreeNode(undefined), false);
        assertEquals(isTreeNode({}), false);
        assertEquals(isTreeNode({ label: "Test" }), false);
      });
    });

    describe("isTreeNodeStrict", () => {
      it("identifies valid leaf nodes", () => {
        const leaf: TreeLeaf = { label: "Leaf", value: "leaf" };
        assertEquals(isTreeNodeStrict(leaf), true);
      });

      it("identifies valid branch nodes with valid children", () => {
        const branch: TreeBranch = {
          label: "Branch",
          value: "branch",
          children: [
            { label: "Child", value: "child" },
          ],
        };
        assertEquals(isTreeNodeStrict(branch), true);
      });

      it("rejects branch with invalid children", () => {
        const branchWithInvalidChildren = {
          label: "Branch",
          value: "branch",
          children: [{ invalid: "node" }],
        };
        assertEquals(isTreeNodeStrict(branchWithInvalidChildren), false);
      });

      it("rejects invalid objects", () => {
        assertEquals(isTreeNodeStrict(null), false);
        assertEquals(isTreeNodeStrict(undefined), false);
        assertEquals(isTreeNodeStrict({}), false);
        assertEquals(isTreeNodeStrict({ label: "Test" }), false);
      });
    });

    describe("isTree", () => {
      it("identifies valid tree with leaf root", () => {
        const validTree: Tree = {
          root: { label: "Root", value: "root" },
        };
        assertEquals(isTree(validTree), true);
      });

      it("identifies valid tree with complex structure", () => {
        assertEquals(isTree(sampleTree), true);
      });

      it("accepts tree with invalid nested nodes (uses non-strict validation)", () => {
        const treeWithInvalidNodes = {
          root: {
            label: "Root",
            value: "root",
            children: [{ invalid: "node" }],
          },
        };
        assertEquals(isTree(treeWithInvalidNodes), true);
      });

      it("rejects invalid objects", () => {
        assertEquals(isTree(null), false);
        assertEquals(isTree(undefined), false);
        assertEquals(isTree({}), false);
        assertEquals(isTree({ root: null }), false);
        assertEquals(isTree({ root: { invalid: "node" } }), false);
        assertEquals(isTree({ notRoot: { label: "Test", value: "test" } }), false);
      });
    });

    describe("isTreeItem", () => {
      it("identifies valid leaf item", () => {
        const leafItem: TreeItem = {
          label: "Test",
          value: "test",
          path: ["folder"],
          type: "leaf",
        };
        assertEquals(isTreeItem(leafItem), true);
      });

      it("identifies valid branch item", () => {
        const branchItem: TreeItem = {
          label: "Branch",
          value: "branch",
          path: [],
          type: "branch",
          collapsed: false,
        };
        assertEquals(isTreeItem(branchItem), true);
      });

      it("accepts branch with collapsed true", () => {
        const collapsedBranch = {
          label: "Branch",
          value: "branch",
          path: ["parent"],
          type: "branch",
          collapsed: true,
        };
        assertEquals(isTreeItem(collapsedBranch), true);
      });

      it("rejects branch without collapsed property", () => {
        const invalidBranch = {
          label: "Branch",
          value: "branch",
          path: [],
          type: "branch",
        };
        assertEquals(isTreeItem(invalidBranch), false);
      });
      
      it("rejects item without path property", () => {
        const invalidItem = {
          label: "Item",
          value: "item",
          type: "leaf",
        };
        assertEquals(isTreeItem(invalidItem), false);
      });

      it("rejects invalid type values", () => {
        const invalidType = {
          label: "Test",
          value: "test",
          path: [],
          type: "invalid",
        };
        assertEquals(isTreeItem(invalidType), false);
      });

      it("rejects invalid objects", () => {
        assertEquals(isTreeItem(null), false);
        assertEquals(isTreeItem(undefined), false);
        assertEquals(isTreeItem({}), false);
        assertEquals(isTreeItem({ label: "Test", value: "test" }), false);
        assertEquals(isTreeItem({ label: "Test", value: "test", path: [], type: 123 }), false);
        assertEquals(isTreeItem({ label: 123, value: "test", path: [], type: "leaf" }), false);
        assertEquals(isTreeItem({ label: "Test", value: 123, path: [], type: "leaf" }), false);
        assertEquals(isTreeItem({ label: "Test", value: "test", path: "not-array", type: "leaf" }), false);
        assertEquals(isTreeItem({ label: "Test", value: "test", path: [123], type: "leaf" }), false);
      });
    });

    describe("isTreeLeafItem", () => {
      it("identifies valid leaf item", () => {
        const leafItem: TreeLeafItem = {
          label: "Test",
          value: "test",
          path: [],
          type: "leaf",
        };
        assertEquals(isTreeLeafItem(leafItem), true);
      });

      it("rejects branch items", () => {
        const branchItem: TreeBranchItem = {
          label: "Branch",
          value: "branch",
          path: [],
          type: "branch",
          collapsed: false,
        };
        assertEquals(isTreeLeafItem(branchItem), false);
      });

      it("rejects invalid objects", () => {
        assertEquals(isTreeLeafItem(null), false);
        assertEquals(isTreeLeafItem(undefined), false);
        assertEquals(isTreeLeafItem({}), false);
        assertEquals(isTreeLeafItem({ label: "Test", value: "test" }), false);
        assertEquals(isTreeLeafItem({ label: "Test", value: "test", path: [], type: "branch", collapsed: true }), false);
      });
    });

    describe("isTreeBranchItem", () => {
      it("identifies valid branch item", () => {
        const branchItem: TreeBranchItem = {
          label: "Branch",
          value: "branch",
          path: [],
          type: "branch",
          collapsed: false,
        };
        assertEquals(isTreeBranchItem(branchItem), true);
      });

      it("accepts branch with collapsed true", () => {
        const collapsedBranch: TreeBranchItem = {
          label: "Branch",
          value: "branch",
          path: ["parent", "child"],
          type: "branch",
          collapsed: true,
        };
        assertEquals(isTreeBranchItem(collapsedBranch), true);
      });

      it("rejects leaf items", () => {
        const leafItem: TreeLeafItem = {
          label: "Leaf",
          value: "leaf",
          path: [],
          type: "leaf",
        };
        assertEquals(isTreeBranchItem(leafItem), false);
      });

      it("rejects branch without collapsed property", () => {
        const invalidBranch = {
          label: "Branch",
          value: "branch",
          path: [],
          type: "branch",
        };
        assertEquals(isTreeBranchItem(invalidBranch), false);
      });

      it("rejects invalid objects", () => {
        assertEquals(isTreeBranchItem(null), false);
        assertEquals(isTreeBranchItem(undefined), false);
        assertEquals(isTreeBranchItem({}), false);
        assertEquals(isTreeBranchItem({ label: "Test", value: "test" }), false);
        assertEquals(isTreeBranchItem({ label: "Test", value: "test", path: [], type: "leaf" }), false);
      });
    });
  });
});