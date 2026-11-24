import { Component } from "react";

/** Renders `fallback` if the child tree throws or WebGL is unavailable. */
export class CanvasBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(err) {
    console.warn("Orrery failed, falling back to 2D map:", err);
  }

  render() {
    const noGl = typeof window !== "undefined" && !window.WebGLRenderingContext;
    return this.state.failed || noGl ? this.props.fallback : this.props.children;
  }
}
