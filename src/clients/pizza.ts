import { Effect, Thing } from "../things";

export class PizzaNode {
  children: Map<string, PizzaNode> = new Map();
  letters: string;
  effects: Effect[] = [];

  constructor(letters: string) {
    this.letters = letters;
  }

  get options(): Effect[] {
    return Array.from(this.children.values()).reduce(
      (acc, curr) => acc.concat(curr.options),
      this.effects
    );
  }
}

export class PizzaTree {
  root: PizzaNode;
  constructor() {
    this.root = new PizzaNode("");
  }

  reset() {
    this.root = new PizzaNode("");
  }

  addEffect(name: string, effect: Effect) {
    function _add(node: PizzaNode, n: string) {
      // If we have reached 4 letters, exhausted the input or have reached an invalid letter, finish descending.
      if (node.letters.length === 4 || n.length === 0 || n.match(/^[^a-z0-9\"\']/)) {
        node.effects.push(effect);
        return;
      }
      const letter = n.charAt(0);

      if (!node.children.has(letter)) {
        node.children.set(letter, new PizzaNode(node.letters + letter));
      }

      const child = node.children.get(letter);

      if (child) _add(child, n.slice(1));
    }

    _add(this.root, name);
  }

  precalculate(): void {
    function _calc(node: PizzaNode) {
      let options = node.options;
      for (let option of options) {
        option._pizza = {
          letters: node.letters.toUpperCase(),
          options: options.length,
        };
      }
      if (options.length > 1) {
        for (let child of node.children.values()) {
          _calc(child);
        }
      }
    }

    _calc(this.root);
  }

  build(things: Map<string, Thing>) {
    this.reset();

    for (const thing of things.values()) {
      if (!(thing instanceof Effect)) continue;
      if (thing.get().hookah) {
        this.addEffect(thing.name(), thing);
      }
    }
    this.precalculate();
  }

  findPizzas(letters: string) {
    let node = this.root;
    let i = 0;
    for (; i <= letters.length; i++) {
      const child = node.children.get(letters.charAt(i));
      if (child) node = child;
      else break;
    }

    return [node.options, i] as [options: Effect[], functionalLetters: number];
  }
}

export const pizzaTree = new PizzaTree();
