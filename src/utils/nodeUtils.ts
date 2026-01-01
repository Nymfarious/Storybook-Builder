import { Node, LeafNode, SplitNode } from '@/types/nodes';

export const uid = () => crypto.randomUUID();

export const appendGeneratedLine = (existing: string, newText: string) => {
  if (!existing.trim()) return newText;
  return existing + "\n\n" + newText;
};

export const DEFAULT_LEAF = (): LeafNode => ({
  kind: "leaf",
  id: uid(),
  contentType: "text",
  textProps: {
    text: "",
    fontSize: 16,
    color: "#374151",
    fontWeight: "normal",
    textAlign: "left",
    fontFamily: "Georgia, serif",
    lineHeight: 1.6,
    letterSpacing: 0,
    italic: false,
    underline: false,
    strikethrough: false,
    textShadow: "none",
    textTransform: "none",
    wordSpacing: 0,
    textBackground: "transparent",
    textBackgroundOpacity: 0,
    fontWeight100: 400,
    textGradient: "",
  },
  imageProps: {
    url: "",
    objectFit: "cover",
    opacity: 1,
    borderRadius: 4,
  },
  backgroundProps: {
    color: "#faf9f6",
    opacity: 1,
  },
  padding: {
    top: 16,
    right: 16,
    bottom: 16,
    left: 16,
  }
});

export const findNode = (root: Node, id: string): Node | null => {
  if (root.id === id) return root;
  if (root.kind === "split") {
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
};

export const findParentNode = (root: Node, id: string): SplitNode | null => {
  if (root.kind !== "split") return null;
  
  for (const child of root.children) {
    if (child.id === id) return root;
    if (child.kind === "split") {
      const found = findParentNode(child, id);
      if (found) return found;
    }
  }
  return null;
};

export const removeNode = (root: Node, id: string): Node => {
  if (root.kind !== "split") return root;
  
  const newChildren = root.children.filter(child => child.id !== id);
  
  // If a child was removed, recalculate sizes
  if (newChildren.length !== root.children.length) {
    const newSizes = newChildren.map(() => 1 / newChildren.length);
    return { ...root, children: newChildren, sizes: newSizes };
  }
  
  // Recurse into children
  return {
    ...root,
    children: root.children.map(child => removeNode(child, id))
  };
};

export const replaceNode = (root: Node, id: string, newNode: Node): Node => {
  if (root.id === id) return newNode;
  if (root.kind === "split") {
    return {
      ...root,
      children: root.children.map(child => replaceNode(child, id, newNode))
    };
  }
  return root;
};

export const duplicateNodeInParent = (root: Node, id: string): Node => {
  if (root.kind !== "split") return root;
  
  const childIndex = root.children.findIndex(child => child.id === id);
  
  if (childIndex !== -1) {
    const childToDuplicate = root.children[childIndex];
    const duplicatedChild = JSON.parse(JSON.stringify(childToDuplicate));
    duplicatedChild.id = uid();
    
    // Assign new IDs to all nested nodes
    const reassignIds = (node: Node): Node => {
      if (node.kind === "leaf") {
        return { ...node, id: uid() };
      } else {
        return {
          ...node,
          id: uid(),
          children: node.children.map(reassignIds)
        };
      }
    };
    
    const newChild = reassignIds(duplicatedChild);
    const newChildren = [
      ...root.children.slice(0, childIndex + 1),
      newChild,
      ...root.children.slice(childIndex + 1)
    ];
    const newSizes = newChildren.map(() => 1 / newChildren.length);
    
    return { ...root, children: newChildren, sizes: newSizes };
  }
  
  return {
    ...root,
    children: root.children.map(child => duplicateNodeInParent(child, id))
  };
};

export const updateNode = (root: Node, id: string, updater: (node: Node) => Node): Node => {
  if (root.id === id) return updater(root);
  if (root.kind === "split") {
    return {
      ...root,
      children: root.children.map(child => updateNode(child, id, updater))
    };
  }
  return root;
};

export const applyResize = (node: Node, index: number, delta: number): Node => {
  if (node.kind !== "split") return node;
  const newSizes = [...node.sizes];
  const total = newSizes.reduce((sum, size) => sum + size, 0);
  const normalizedDelta = delta / total;
  
  newSizes[index] = Math.max(0.05, Math.min(0.95, newSizes[index] + normalizedDelta));
  if (index + 1 < newSizes.length) {
    newSizes[index + 1] = Math.max(0.05, Math.min(0.95, newSizes[index + 1] - normalizedDelta));
  }
  
  const newTotal = newSizes.reduce((sum, size) => sum + size, 0);
  const normalizedSizes = newSizes.map(size => size / newTotal);
  
  return { ...node, sizes: normalizedSizes };
};

export const storyPrompts = [
  "A mysterious figure emerges from the shadows",
  "The hero discovers an ancient artifact",
  "An unexpected ally arrives at the crucial moment",
  "The villain reveals their true plan",
  "A dramatic chase begins through the city"
];
